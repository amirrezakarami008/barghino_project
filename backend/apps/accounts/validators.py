"""Validators for Iranian mobile numbers and national IDs."""

from __future__ import annotations

import re

from django.core.exceptions import ValidationError

_DIGIT_TRANSLATION = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
_MOBILE_RE = re.compile(r"^09\d{9}$")
_NATIONAL_ID_RE = re.compile(r"^\d{10}$")
_COMPANY_NATIONAL_ID_RE = re.compile(r"^\d{11}$")
_REPEATED_DIGIT_RE = re.compile(r"^(\d)\1{9}$")
_LEGAL_COEFFICIENTS = (29, 27, 23, 19, 17, 29, 27, 23, 19, 17)


def normalize_digits(value: str) -> str:
    return (value or "").translate(_DIGIT_TRANSLATION)


def digits_only(value: str) -> str:
    return re.sub(r"\D", "", normalize_digits(value))


def normalize_iran_mobile(value: str) -> str:
    """Return ``09xxxxxxxxx`` from Persian digits, ``+98``, or a leading ``9``."""
    digits = digits_only(value)
    if digits.startswith("0098"):
        digits = digits[4:]
    elif digits.startswith("98") and len(digits) >= 12:
        digits = digits[2:]
    if len(digits) == 10 and digits.startswith("9"):
        digits = "0" + digits
    return digits


def validate_iran_mobile(value: str) -> None:
    if not _MOBILE_RE.fullmatch(normalize_iran_mobile(value)):
        raise ValidationError("Enter a valid Iranian mobile number.", code="invalid_phone")


def validate_national_id(value: str) -> None:
    code = digits_only(value)
    if not _NATIONAL_ID_RE.fullmatch(code) or _REPEATED_DIGIT_RE.fullmatch(code):
        raise ValidationError("Enter a valid Iranian national ID.", code="invalid_national_id")

    check = int(code[9])
    total = sum(int(code[index]) * (10 - index) for index in range(9))
    remainder = total % 11
    expected = remainder if remainder < 2 else 11 - remainder
    if check != expected:
        raise ValidationError("Enter a valid Iranian national ID.", code="invalid_national_id")


def validate_company_national_id(value: str) -> None:
    code = digits_only(value)
    if not _COMPANY_NATIONAL_ID_RE.fullmatch(code):
        raise ValidationError(
            "Enter a valid 11-digit company national ID.",
            code="invalid_company_national_id",
        )

    check = int(code[10])
    offset = int(code[9]) + 2
    total = sum((int(code[index]) + offset) * _LEGAL_COEFFICIENTS[index] for index in range(10))
    remainder = total % 11
    if remainder == 10:
        remainder = 0
    if remainder != check:
        raise ValidationError(
            "Enter a valid 11-digit company national ID.",
            code="invalid_company_national_id",
        )
