"""Read queries for accounts. Write use cases live in services."""

from __future__ import annotations

from apps.accounts.models import IndividualProfile, LegalProfile, User


def phone_is_registered(phone: str) -> bool:
    return User.objects.filter(phone=phone).exists()


def national_id_is_registered(national_id: str) -> bool:
    return IndividualProfile.objects.filter(national_id=national_id).exists()


def company_national_id_is_registered(company_national_id: str) -> bool:
    return LegalProfile.objects.filter(company_national_id=company_national_id).exists()


def get_active_phone_verified_user(phone: str) -> User | None:
    return User.objects.filter(
        phone=phone,
        is_active=True,
        phone_verified_at__isnull=False,
    ).first()


def get_account(user: User) -> User:
    return User.objects.select_related("individual_profile", "legal_profile").get(pk=user.pk)
