"""User manager that creates accounts by mobile number."""

from __future__ import annotations

from typing import Any

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import UserManager as DjangoUserManager
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.accounts.validators import normalize_iran_mobile, validate_iran_mobile


class UserManager(DjangoUserManager):
    """Create users with ``phone`` as the unique login identifier."""

    def _create_user(
        self,
        phone: str,
        email: str | None,
        password: str | None,
        **extra_fields: Any,
    ):
        if not phone:
            raise ValueError("The phone number must be set.")
        try:
            validate_iran_mobile(phone)
        except ValidationError as exc:
            raise ValueError("The phone number is not a valid Iranian mobile number.") from exc

        phone = normalize_iran_mobile(phone)
        email = self.normalize_email(email) if email else ""
        extra_fields.pop("username", None)
        user = self.model(phone=phone, email=email, username=phone, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(
        self,
        phone: str,
        email: str | None = None,
        password: str | None = None,
        **extra_fields: Any,
    ):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, email, password, **extra_fields)

    def create_superuser(
        self,
        phone: str,
        email: str | None = None,
        password: str | None = None,
        **extra_fields: Any,
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("phone_verified_at", timezone.now())

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(phone, email, password, **extra_fields)
