"""One-time codes stored as hashes in Redis.

Register and login use separate keys. Plaintext codes go to the SMS task and,
when enabled in development, the console. A missing account still gets the
same request response as a real one.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import secrets

from django.conf import settings
from rest_framework.exceptions import Throttled, ValidationError

from apps.accounts.models import User
from apps.accounts.selectors import get_active_phone_verified_user
from apps.accounts.tasks import send_otp_sms
from apps.core.redis import build_key, get_redis

logger = logging.getLogger("apps.accounts.otp")

PURPOSE_REGISTER = "register"
PURPOSE_LOGIN = "login"

OTP_DISPATCHED_DETAIL = "If the number can receive a code, it has been sent."


def request_login_code(*, phone: str, ip: str) -> None:
    _enforce_hourly(phone, ip)
    if get_active_phone_verified_user(phone) is None:
        _log_skipped(PURPOSE_LOGIN, phone, "no_active_verified_account; register first")
        return
    if not _reserve_send(PURPOSE_LOGIN, phone):
        _log_skipped(PURPOSE_LOGIN, phone, "resend_cooldown; retry after the cooldown")
        return
    _store_and_send(purpose=PURPOSE_LOGIN, phone=phone, payload={})


def request_register_code(*, phone: str, ip: str, payload: dict) -> None:
    _enforce_hourly(phone, ip)
    if not _reserve_send(PURPOSE_REGISTER, phone):
        _log_skipped(PURPOSE_REGISTER, phone, "resend_cooldown; retry after the cooldown")
        return
    _store_and_send(purpose=PURPOSE_REGISTER, phone=phone, payload=payload)


def verify_login_code(*, phone: str, code: str) -> User:
    consume_code(purpose=PURPOSE_LOGIN, phone=phone, code=code)
    user = get_active_phone_verified_user(phone)
    if user is None:
        raise _invalid()
    return user


def consume_code(*, purpose: str, phone: str, code: str) -> dict:
    """Return the stored payload when the code matches. Deletes it on success."""
    lock_key = build_key("accounts", "otp", "lock", purpose, phone)
    token = secrets.token_hex(8)
    if not get_redis().acquire_lock(lock_key, token, ttl=5):
        raise _invalid()
    try:
        return _consume_locked(purpose, phone, code)
    finally:
        get_redis().release_lock(lock_key, token)


def _consume_locked(purpose: str, phone: str, code: str) -> dict:
    key = _code_key(purpose, phone)
    record = get_redis().get(key)
    if not isinstance(record, dict) or "code_hash" not in record:
        raise _invalid()

    attempts = int(record.get("attempts", 0))
    if attempts >= settings.OTP_MAX_ATTEMPTS:
        get_redis().delete(key)
        raise _too_many_attempts()

    if not hmac.compare_digest(record["code_hash"], _hash_code(purpose, phone, code)):
        attempts += 1
        if attempts >= settings.OTP_MAX_ATTEMPTS:
            get_redis().delete(key)
            raise _too_many_attempts()
        record["attempts"] = attempts
        _keep_ttl(key, record)
        raise _invalid()

    payload = record.get("payload") or {}
    get_redis().delete(key)
    return payload


def _store_and_send(*, purpose: str, phone: str, payload: dict) -> None:
    code = f"{secrets.randbelow(1_000_000):06d}"
    record = {
        "code_hash": _hash_code(purpose, phone, code),
        "attempts": 0,
        "payload": payload,
    }
    get_redis().set(_code_key(purpose, phone), record, ttl=settings.OTP_CODE_TTL_SECONDS)
    if settings.DEBUG and settings.OTP_LOG_CODES:
        logger.info(
            "OTP purpose=%s phone=%s code=%s ttl=%ss",
            purpose,
            phone,
            code,
            settings.OTP_CODE_TTL_SECONDS,
        )
    send_otp_sms.delay(phone, code, purpose)


def _log_skipped(purpose: str, phone: str, reason: str) -> None:
    if settings.DEBUG and settings.OTP_LOG_CODES:
        logger.info("OTP not generated purpose=%s phone=%s reason=%s", purpose, phone, reason)


def _enforce_hourly(phone: str, ip: str) -> None:
    _hit_limit(
        build_key("accounts", "otp", "hour", "phone", phone),
        settings.OTP_PHONE_HOURLY_LIMIT,
    )
    _hit_limit(
        build_key("accounts", "otp", "hour", "ip", ip or "unknown"),
        settings.OTP_IP_HOURLY_LIMIT,
    )


def _hit_limit(key: str, limit: int) -> None:
    redis = get_redis()
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, settings.OTP_HOURLY_WINDOW_SECONDS)
    if count > limit:
        raise Throttled(detail="Too many code requests. Try again later.")


def _reserve_send(purpose: str, phone: str) -> bool:
    return get_redis().acquire_lock(
        _cooldown_key(purpose, phone),
        "1",
        ttl=settings.OTP_CODE_TTL_SECONDS,
    )


def _keep_ttl(key: str, record: dict) -> None:
    remaining = get_redis().ttl(key)
    if remaining < 1:
        get_redis().delete(key)
        return
    get_redis().set(key, record, ttl=remaining)


def _hash_code(purpose: str, phone: str, code: str) -> str:
    digest = hmac.new(
        settings.SECRET_KEY.encode(),
        f"{purpose}:{phone}:{code}".encode(),
        hashlib.sha256,
    )
    return digest.hexdigest()


def _code_key(purpose: str, phone: str) -> str:
    return build_key("accounts", "otp", purpose, phone)


def _cooldown_key(purpose: str, phone: str) -> str:
    return build_key("accounts", "otp", "cooldown", purpose, phone)


def _invalid() -> ValidationError:
    return ValidationError("The code is invalid or has expired.", code="otp_invalid")


def _too_many_attempts() -> ValidationError:
    return ValidationError(
        "Too many attempts. Request a new code.",
        code="otp_attempts_exceeded",
    )
