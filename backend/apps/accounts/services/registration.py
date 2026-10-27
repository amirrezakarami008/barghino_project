"""Create a customer account after the registration code is confirmed."""

from __future__ import annotations

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.accounts.models import AccountType, IndividualProfile, LegalProfile, User
from apps.accounts.selectors import (
    company_national_id_is_registered,
    national_id_is_registered,
    phone_is_registered,
)
from apps.accounts.services.otp import PURPOSE_REGISTER, consume_code, request_register_code


def start_registration(data: dict, *, ip: str) -> None:
    phone = data["phone"]
    if phone_is_registered(phone):
        raise ValidationError({"phone": "A user with this phone already exists."})

    account_type = data["account_type"]
    if account_type == AccountType.INDIVIDUAL and national_id_is_registered(data["national_id"]):
        raise ValidationError({"national_id": "A profile with this national ID already exists."})
    if account_type == AccountType.LEGAL and company_national_id_is_registered(
        data["company_national_id"]
    ):
        raise ValidationError(
            {"company_national_id": "A company with this national ID already exists."}
        )

    request_register_code(phone=phone, ip=ip, payload=data)


def verify_registration(*, phone: str, code: str) -> User:
    payload = consume_code(purpose=PURPOSE_REGISTER, phone=phone, code=code)
    if payload.get("phone") != phone:
        raise ValidationError("The code is invalid or has expired.", code="otp_invalid")
    return _create_customer(payload)


@transaction.atomic
def _create_customer(payload: dict) -> User:
    if phone_is_registered(payload["phone"]):
        raise ValidationError({"phone": "A user with this phone already exists."})

    now = timezone.now()
    account_type = payload["account_type"]
    if account_type == AccountType.INDIVIDUAL:
        first_name = payload["first_name"]
        last_name = payload["last_name"]
    else:
        first_name = payload["representative_first_name"]
        last_name = payload["representative_last_name"]

    try:
        user = User.objects.create_user(
            phone=payload["phone"],
            password=None,
            account_type=account_type,
            path=payload["path"],
            first_name=first_name,
            last_name=last_name,
            terms_accepted_at=now,
            phone_verified_at=now,
        )
        if account_type == AccountType.INDIVIDUAL:
            IndividualProfile.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                national_id=payload["national_id"],
            )
        else:
            LegalProfile.objects.create(
                user=user,
                company_name=payload["company_name"],
                company_national_id=payload["company_national_id"],
                representative_first_name=first_name,
                representative_last_name=last_name,
                representative_national_id=payload["representative_national_id"],
                registration_number=payload.get("registration_number", ""),
                economic_code=payload.get("economic_code", ""),
            )
    except IntegrityError as exc:
        raise ValidationError(
            "This registration can no longer be completed.",
            code="registration_conflict",
        ) from exc
    return user
