"""JWT authentication with token_version + Redis access denylist checks."""

from __future__ import annotations

from typing import Any

from django.contrib.auth.models import AbstractBaseUser, AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import Token

from apps.accounts.services.sessions import is_access_token_denied
from apps.core.redis import build_key, get_redis


def access_token_is_revoked(validated_token: Token, user: AbstractBaseUser) -> str | None:
    """Return an error code if the access token must be rejected, else ``None``."""
    try:
        token_tv = int(validated_token.get("tv", 0))
    except (TypeError, ValueError):
        return "token_not_valid"

    user_tv = int(getattr(user, "token_version", 0))
    if token_tv != user_tv:
        return "token_not_valid"

    jti = validated_token.get("jti")
    if jti and is_access_token_denied(str(jti)):
        return "token_not_valid"

    return None


def user_from_validated_access(validated_token: Token) -> AbstractBaseUser | AnonymousUser:
    """Resolve user and enforce tv/denylist. Returns AnonymousUser on failure."""
    from django.contrib.auth import get_user_model

    try:
        user_id = validated_token["user_id"]
        user = get_user_model().objects.get(pk=user_id, is_active=True)
    except (KeyError, get_user_model().DoesNotExist, TypeError):
        return AnonymousUser()

    if access_token_is_revoked(validated_token, user):
        return AnonymousUser()
    return user


class DenylistJWTAuthentication(JWTAuthentication):
    """Reject access tokens whose ``tv`` is stale or whose ``jti`` is denylisted."""

    def get_user(self, validated_token: Token) -> AbstractBaseUser:
        user = super().get_user(validated_token)
        reason = access_token_is_revoked(validated_token, user)
        if reason:
            raise InvalidToken({"detail": "Token is invalid or expired", "code": reason})
        return user


def ws_connection_key(user_id: int | str) -> str:
    return build_key("realtime", "ws_connections", user_id)


def try_acquire_ws_slot(user_id: int | str, *, max_connections: int = 5) -> bool:
    """Increment per-user WS connection count; return False if over the limit."""
    redis = get_redis()
    key = ws_connection_key(user_id)
    count = redis.incr(key)
    if count == 1:
        # Soft TTL so abandoned counters eventually expire.
        redis.raw.expire(key, 60 * 60 * 24)
    if count > max_connections:
        redis.incr(key, -1)
        return False
    return True


def release_ws_slot(user_id: int | str) -> None:
    redis = get_redis()
    key = ws_connection_key(user_id)
    count = redis.incr(key, -1)
    if count <= 0:
        redis.delete(key)


def get_bearer_from_headers(headers: list[tuple[bytes, bytes]] | Any) -> str | None:
    for name, value in headers:
        if name.lower() == b"authorization":
            text = value.decode() if isinstance(value, bytes) else str(value)
            parts = text.split(None, 1)
            if len(parts) == 2 and parts[0].lower() == "bearer":
                return parts[1].strip() or None
    return None


def get_token_from_subprotocols(subprotocols: list[str] | Any) -> tuple[str | None, str | None]:
    """Parse ``['bearer', '<jwt>']``; return ``(token, accepted_subprotocol)``."""
    protocols = [str(p) for p in (subprotocols or [])]
    lowered = [p.lower() for p in protocols]
    if "bearer" in lowered:
        idx = lowered.index("bearer")
        if idx + 1 < len(protocols):
            token = protocols[idx + 1].strip()
            if token:
                return token, "bearer"
    return None, None
