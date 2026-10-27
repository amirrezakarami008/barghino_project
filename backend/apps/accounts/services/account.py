"""Editable fields on the signed-in account."""

from __future__ import annotations

from django.db import transaction

from apps.accounts.models import AccountType, IndividualProfile, LegalProfile, User

_EDITABLE_ACCOUNT_FIELDS = ("first_name", "last_name")


@transaction.atomic
def update_account(user: User, **fields: str) -> User:
    update_fields = [name for name in _EDITABLE_ACCOUNT_FIELDS if name in fields]
    for name in update_fields:
        setattr(user, name, fields[name])
    if update_fields:
        user.save(update_fields=update_fields)
        if user.account_type == AccountType.INDIVIDUAL:
            try:
                profile = user.individual_profile
            except IndividualProfile.DoesNotExist:
                profile = None
            if profile is not None:
                for name in update_fields:
                    setattr(profile, name, getattr(user, name))
                profile.save(update_fields=update_fields)
        elif user.account_type == AccountType.LEGAL:
            try:
                profile = user.legal_profile
            except LegalProfile.DoesNotExist:
                profile = None
            if profile is not None:
                if "first_name" in update_fields:
                    profile.representative_first_name = user.first_name
                if "last_name" in update_fields:
                    profile.representative_last_name = user.last_name
                profile_fields = []
                if "first_name" in update_fields:
                    profile_fields.append("representative_first_name")
                if "last_name" in update_fields:
                    profile_fields.append("representative_last_name")
                profile.save(update_fields=profile_fields)
    return user
