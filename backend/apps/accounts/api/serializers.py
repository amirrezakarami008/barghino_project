from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from apps.accounts.models import AccountType, IndividualProfile, LegalProfile, User, UserPath
from apps.accounts.tokens import VersionedRefreshToken
from apps.accounts.validators import (
    digits_only,
    normalize_iran_mobile,
    validate_company_national_id,
    validate_iran_mobile,
    validate_national_id,
)


def _validate_phone(value: str) -> str:
    phone = normalize_iran_mobile(value)
    try:
        validate_iran_mobile(phone)
    except DjangoValidationError as exc:
        raise serializers.ValidationError("Enter a valid Iranian mobile number.") from exc
    return phone


def _validate_identity(value: str, *, company: bool) -> str:
    code = digits_only(value)
    validator = validate_company_national_id if company else validate_national_id
    try:
        validator(code)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(exc.messages[0]) from exc
    return code


class UserSerializer(serializers.ModelSerializer):
    is_phone_verified = serializers.BooleanField(
        read_only=True,
        help_text="True when `phone_verified_at` is set.",
    )
    role = serializers.CharField(
        read_only=True,
        help_text="`admin` if staff, otherwise `user`.",
    )
    national_id = serializers.SerializerMethodField(
        help_text="Individual national id, or legal representative national id.",
    )
    company_name = serializers.SerializerMethodField(
        help_text="Set for legal accounts only.",
    )
    company_national_id = serializers.SerializerMethodField(
        help_text="Company national id for legal accounts.",
    )
    identity_profile = serializers.SerializerMethodField(
        help_text="Structured identity details used to prefill contract review.",
    )
    identity_profile_completion = serializers.SerializerMethodField(
        help_text="Required identity fields and whether the profile is complete.",
    )

    class Meta:
        model = User
        fields = (
            "uuid",
            "phone",
            "username",
            "email",
            "first_name",
            "last_name",
            "account_type",
            "path",
            "role",
            "national_id",
            "company_name",
            "company_national_id",
            "identity_profile",
            "identity_profile_completion",
            "date_joined",
            "is_phone_verified",
        )
        read_only_fields = (
            "uuid",
            "phone",
            "username",
            "email",
            "account_type",
            "path",
            "role",
            "national_id",
            "company_name",
            "company_national_id",
            "identity_profile",
            "identity_profile_completion",
            "date_joined",
            "is_phone_verified",
        )
        extra_kwargs = {
            "phone": {"help_text": "Iranian mobile stored as 09xxxxxxxxx."},
            "path": {"help_text": "Product path chosen at registration: sell | install."},
            "account_type": {"help_text": "individual | legal (empty for some staff)."},
            "first_name": {"help_text": "Editable via PATCH /auth/me/."},
            "last_name": {"help_text": "Editable via PATCH /auth/me/."},
        }

    def get_national_id(self, user: User) -> str | None:
        individual = _individual(user)
        if individual is not None:
            return individual.national_id
        legal = _legal(user)
        if legal is not None:
            return legal.representative_national_id
        return None

    def get_company_name(self, user: User) -> str | None:
        legal = _legal(user)
        return legal.company_name if legal is not None else None

    def get_company_national_id(self, user: User) -> str | None:
        legal = _legal(user)
        return legal.company_national_id if legal is not None else None

    def get_identity_profile(self, user: User) -> dict | None:
        individual = _individual(user)
        if individual is not None:
            return {
                "kind": "individual",
                "first_name": individual.first_name,
                "last_name": individual.last_name,
                "national_id": individual.national_id,
            }
        legal = _legal(user)
        if legal is not None:
            return {
                "kind": "legal",
                "company_name": legal.company_name,
                "company_national_id": legal.company_national_id,
                "representative_first_name": legal.representative_first_name,
                "representative_last_name": legal.representative_last_name,
                "representative_national_id": legal.representative_national_id,
                "registration_number": legal.registration_number,
                "economic_code": legal.economic_code,
            }
        return None

    def get_identity_profile_completion(self, user: User) -> dict:
        if user.account_type == AccountType.INDIVIDUAL:
            individual = _individual(user)
            required = {
                "first_name": individual.first_name if individual else user.first_name,
                "last_name": individual.last_name if individual else user.last_name,
                "national_id": individual.national_id if individual else None,
            }
        elif user.account_type == AccountType.LEGAL:
            legal = _legal(user)
            required = {
                "company_name": legal.company_name if legal else None,
                "company_national_id": legal.company_national_id if legal else None,
                "representative_first_name": (
                    legal.representative_first_name if legal else user.first_name
                ),
                "representative_last_name": (
                    legal.representative_last_name if legal else user.last_name
                ),
                "representative_national_id": legal.representative_national_id if legal else None,
            }
        else:
            required = {}
        missing_fields = [name for name, value in required.items() if not value]
        return {"is_complete": not missing_fields, "missing_fields": missing_fields}

    def validate(self, attrs: dict) -> dict:
        if self.instance and self.instance.account_type:
            first_name = attrs.get("first_name", self.instance.first_name).strip()
            last_name = attrs.get("last_name", self.instance.last_name).strip()
            errors = {}
            if not first_name:
                errors["first_name"] = "This field cannot be blank for a customer account."
            if not last_name:
                errors["last_name"] = "This field cannot be blank for a customer account."
            if errors:
                raise serializers.ValidationError(errors)
            attrs["first_name"] = first_name
            attrs["last_name"] = last_name
        return attrs


class RegisterSerializer(serializers.Serializer):
    account_type = serializers.ChoiceField(
        choices=AccountType.choices,
        help_text="`individual` or `legal`.",
    )
    path = serializers.ChoiceField(
        choices=UserPath.choices,
        help_text="`sell` or `install`.",
    )
    phone = serializers.CharField(help_text="Iranian mobile; normalized to 09xxxxxxxxx.")
    terms_accepted = serializers.BooleanField(help_text="Must be true.")
    first_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        help_text="Required for individual.",
    )
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        help_text="Required for individual.",
    )
    national_id = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="10-digit national id (individual).",
    )
    company_name = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        help_text="Required for legal.",
    )
    company_national_id = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="11-digit company national id (legal).",
    )
    representative_first_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        help_text="Required for legal.",
    )
    representative_last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        help_text="Required for legal.",
    )
    representative_national_id = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Representative national id (legal).",
    )
    registration_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        default="",
        help_text="Optional company registration number.",
    )
    economic_code = serializers.CharField(
        max_length=14,
        required=False,
        allow_blank=True,
        default="",
        help_text="Optional economic code.",
    )

    def validate_phone(self, value: str) -> str:
        return _validate_phone(value)

    def validate(self, attrs: dict) -> dict:
        if attrs["terms_accepted"] is not True:
            raise serializers.ValidationError({"terms_accepted": "You must accept the terms."})
        if attrs["account_type"] == AccountType.INDIVIDUAL:
            return self._validate_individual(attrs)
        return self._validate_legal(attrs)

    def _validate_individual(self, attrs: dict) -> dict:
        first_name = attrs.get("first_name", "").strip()
        last_name = attrs.get("last_name", "").strip()
        if not first_name or not last_name:
            raise serializers.ValidationError(
                {"first_name": "First name and last name are required."}
            )
        return {
            "account_type": attrs["account_type"],
            "path": attrs["path"],
            "phone": attrs["phone"],
            "terms_accepted": True,
            "first_name": first_name,
            "last_name": last_name,
            "national_id": _validate_identity(attrs.get("national_id", ""), company=False),
        }

    def _validate_legal(self, attrs: dict) -> dict:
        company_name = attrs.get("company_name", "").strip()
        representative_first_name = attrs.get("representative_first_name", "").strip()
        representative_last_name = attrs.get("representative_last_name", "").strip()
        if not company_name or not representative_first_name or not representative_last_name:
            raise serializers.ValidationError(
                {"company_name": "Company name and the representative's name are required."}
            )
        return {
            "account_type": attrs["account_type"],
            "path": attrs["path"],
            "phone": attrs["phone"],
            "terms_accepted": True,
            "company_name": company_name,
            "company_national_id": _validate_identity(
                attrs.get("company_national_id", ""),
                company=True,
            ),
            "representative_first_name": representative_first_name,
            "representative_last_name": representative_last_name,
            "representative_national_id": _validate_identity(
                attrs.get("representative_national_id", ""),
                company=False,
            ),
            "registration_number": attrs.get("registration_number", ""),
            "economic_code": attrs.get("economic_code", ""),
        }


class DetailResponseSerializer(serializers.Serializer):
    detail = serializers.CharField(help_text="Human-readable status message.")


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField(help_text="JWT access token (send as Bearer).")
    refresh = serializers.CharField(help_text="JWT refresh token.")
    user = UserSerializer()


class OtpRequestSerializer(serializers.Serializer):
    phone = serializers.CharField(help_text="Iranian mobile 09xxxxxxxxx.")

    def validate_phone(self, value: str) -> str:
        return _validate_phone(value)


class OtpVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(help_text="Same phone the OTP was sent to.")
    code = serializers.CharField(help_text="6-digit SMS code.")

    def validate_phone(self, value: str) -> str:
        return _validate_phone(value)

    def validate_code(self, value: str) -> str:
        code = digits_only(value)
        if len(code) != 6:
            raise serializers.ValidationError("Enter the 6-digit code.")
        return code


def _individual(user: User) -> IndividualProfile | None:
    try:
        return user.individual_profile
    except IndividualProfile.DoesNotExist:
        return None


def _legal(user: User) -> LegalProfile | None:
    try:
        return user.legal_profile
    except LegalProfile.DoesNotExist:
        return None


class VersionedTokenRefreshSerializer(TokenRefreshSerializer):
    """Refresh using versioned token classes so ``tv`` is preserved on new access."""

    token_class = VersionedRefreshToken
