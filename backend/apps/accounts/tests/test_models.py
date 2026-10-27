import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from apps.accounts.models import AccountType, IndividualProfile, LegalProfile, User, UserPath
from apps.accounts.tests.factories import UserFactory
from apps.accounts.validators import validate_company_national_id, validate_national_id

VALID_NATIONAL_ID = "0013542419"
SECOND_NATIONAL_ID = "1234567891"
VALID_COMPANY_NATIONAL_ID = "10100360794"


@pytest.mark.django_db
class TestUserIdentity:
    def test_phone_is_login_field_and_username_follows_it(self):
        user = User.objects.create_user(
            phone="۰۹۱۲۳۴۵۶۷۸۹",
            email="person@example.com",
            password=None,
            account_type=AccountType.INDIVIDUAL,
            path=UserPath.SELL,
        )

        assert user.phone == "09123456789"
        assert user.username == "09123456789"
        assert user.role == "user"
        assert user.is_phone_verified is False
        assert user.has_usable_password() is False

    def test_staff_user_is_admin_without_customer_type(self):
        user = UserFactory(is_staff=True, account_type="", path="")

        assert user.role == "admin"
        assert user.account_type == ""

    def test_email_is_unique_case_insensitively(self):
        UserFactory(email="owner@example.com")

        with pytest.raises(IntegrityError), transaction.atomic():
            UserFactory(email="Owner@example.com")

    def test_blank_email_can_repeat(self):
        first = UserFactory(email="")
        second = UserFactory(email="")

        assert first.email == ""
        assert second.email == ""

    def test_invalid_phone_is_rejected(self):
        with pytest.raises(ValueError, match="not a valid Iranian mobile"):
            User.objects.create_user(phone="02112345678", password=None)


@pytest.mark.django_db
class TestProfiles:
    def test_individual_profile_stores_normalized_national_id(self):
        user = UserFactory(account_type=AccountType.INDIVIDUAL, path=UserPath.INSTALL)
        profile = IndividualProfile.objects.create(
            user=user,
            first_name="مهدی",
            last_name="رضایی",
            national_id="۰۰۱۳۵۴۲۴۱۹",
        )

        assert profile.national_id == VALID_NATIONAL_ID
        assert user.individual_profile.national_id == VALID_NATIONAL_ID

    def test_national_id_must_be_valid_and_unique(self):
        user = UserFactory()
        IndividualProfile.objects.create(
            user=user,
            first_name="Ada",
            last_name="Lovelace",
            national_id=VALID_NATIONAL_ID,
        )

        other = UserFactory()
        with pytest.raises(ValidationError):
            IndividualProfile.objects.create(
                user=other,
                first_name="Grace",
                last_name="Hopper",
                national_id="0000000000",
            )
        with pytest.raises(ValidationError):
            IndividualProfile.objects.create(
                user=other,
                first_name="Grace",
                last_name="Hopper",
                national_id=VALID_NATIONAL_ID,
            )

    def test_legal_profile_allows_repeated_representative_national_id(self):
        first_user = UserFactory(account_type=AccountType.LEGAL)
        second_user = UserFactory(account_type=AccountType.LEGAL)
        shared = {
            "representative_first_name": "مهدی",
            "representative_last_name": "رضایی",
            "representative_national_id": SECOND_NATIONAL_ID,
        }
        LegalProfile.objects.create(
            user=first_user,
            company_name="برقینو انرژی",
            company_national_id=VALID_COMPANY_NATIONAL_ID,
            **shared,
        )
        other_company = _company_national_id("1032087451")
        LegalProfile.objects.create(
            user=second_user,
            company_name="شرکت دوم",
            company_national_id=other_company,
            **shared,
        )

        assert (
            LegalProfile.objects.filter(representative_national_id=SECOND_NATIONAL_ID).count() == 2
        )

    def test_company_national_id_checksum_rejects_a_wrong_digit(self):
        with pytest.raises(ValidationError):
            validate_company_national_id("10100360795")
        validate_national_id(VALID_NATIONAL_ID)


def _company_national_id(first_ten: str) -> str:
    offset = int(first_ten[9]) + 2
    coefficients = (29, 27, 23, 19, 17, 29, 27, 23, 19, 17)
    total = sum((int(first_ten[index]) + offset) * coefficients[index] for index in range(10))
    remainder = total % 11
    if remainder == 10:
        remainder = 0
    return f"{first_ten}{remainder}"
