import pytest
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import AccountType, IndividualProfile, LegalProfile, User, UserPath
from apps.accounts.tests.factories import UserFactory
from apps.accounts.tokens import VersionedAccessToken
from apps.core.redis import build_key

VALID_NATIONAL_ID = "0013542419"
SECOND_NATIONAL_ID = "1234567891"
VALID_COMPANY_NATIONAL_ID = "10100360794"
SECOND_COMPANY_NATIONAL_ID = "10320874510"


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def sms_outbox(monkeypatch):
    messages: list[dict[str, str]] = []

    def _send(phone: str, message: str) -> None:
        messages.append({"phone": phone, "message": message})

    monkeypatch.setattr("apps.accounts.services.sms.send_sms", _send)
    return messages


def _code(messages: list[dict[str, str]]) -> str:
    return messages[-1]["message"].rsplit(" ", 1)[-1]


def _individual_payload(**overrides):
    payload = {
        "account_type": AccountType.INDIVIDUAL,
        "path": UserPath.SELL,
        "phone": "09121111111",
        "terms_accepted": True,
        "first_name": "Ada",
        "last_name": "Lovelace",
        "national_id": VALID_NATIONAL_ID,
    }
    payload.update(overrides)
    return payload


def _legal_payload(**overrides):
    payload = {
        "account_type": AccountType.LEGAL,
        "path": UserPath.INSTALL,
        "phone": "09122222222",
        "terms_accepted": True,
        "company_name": "Bargino Co",
        "company_national_id": VALID_COMPANY_NATIONAL_ID,
        "representative_first_name": "Grace",
        "representative_last_name": "Hopper",
        "representative_national_id": SECOND_NATIONAL_ID,
        "registration_number": "12345",
        "economic_code": "14001234567",
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db
class TestRegistrationOtp:
    def test_individual_is_created_only_after_the_code(self, api_client, fake_redis, sms_outbox):
        requested = api_client.post(reverse("v1:accounts:register"), _individual_payload())

        assert requested.status_code == 200
        assert User.objects.filter(phone="09121111111").exists() is False
        assert len(sms_outbox) == 1

        verified = api_client.post(
            reverse("v1:accounts:register-verify"),
            {"phone": "09121111111", "code": _code(sms_outbox)},
        )
        assert verified.status_code == 201
        user = User.objects.get(phone="09121111111")
        assert user.has_usable_password() is False
        assert user.is_phone_verified is True
        assert user.terms_accepted_at is not None
        assert user.account_type == AccountType.INDIVIDUAL
        assert user.path == UserPath.SELL
        profile = IndividualProfile.objects.get(user=user)
        assert profile.national_id == VALID_NATIONAL_ID
        assert verified.data["user"]["role"] == "user"
        assert verified.data["user"]["national_id"] == VALID_NATIONAL_ID
        assert int(VersionedAccessToken(verified.data["access"])["tv"]) == user.token_version

        me = api_client.get(
            reverse("v1:accounts:me"),
            HTTP_AUTHORIZATION=f"Bearer {verified.data['access']}",
        )
        assert me.status_code == 200
        assert me.data["national_id"] == VALID_NATIONAL_ID

        patched = api_client.patch(
            reverse("v1:accounts:me"),
            {"national_id": SECOND_NATIONAL_ID, "role": "admin", "first_name": "Ann"},
            HTTP_AUTHORIZATION=f"Bearer {verified.data['access']}",
        )
        assert patched.status_code == 200
        profile.refresh_from_db()
        user.refresh_from_db()
        assert profile.national_id == VALID_NATIONAL_ID
        assert user.role == "user"
        assert user.first_name == "Ann"

    def test_legal_profiles_may_share_a_representative(self, api_client, fake_redis, sms_outbox):
        first = api_client.post(reverse("v1:accounts:register"), _legal_payload())
        assert first.status_code == 200
        api_client.post(
            reverse("v1:accounts:register-verify"),
            {"phone": "09122222222", "code": _code(sms_outbox)},
        )

        second = api_client.post(
            reverse("v1:accounts:register"),
            _legal_payload(
                phone="09123333333",
                company_national_id=SECOND_COMPANY_NATIONAL_ID,
                company_name="Other Co",
            ),
        )
        assert second.status_code == 200
        verified = api_client.post(
            reverse("v1:accounts:register-verify"),
            {"phone": "09123333333", "code": _code(sms_outbox)},
        )
        assert verified.status_code == 201
        assert LegalProfile.objects.count() == 2
        assert verified.data["user"]["company_national_id"] == SECOND_COMPANY_NATIONAL_ID

    def test_invalid_national_id_sends_nothing(self, api_client, fake_redis, sms_outbox):
        response = api_client.post(
            reverse("v1:accounts:register"),
            _individual_payload(national_id="0000000000"),
        )
        assert response.status_code == 400
        assert sms_outbox == []
        assert User.objects.exists() is False

    def test_taken_phone_is_rejected(self, api_client, fake_redis, sms_outbox):
        UserFactory(phone="09121111111")
        response = api_client.post(reverse("v1:accounts:register"), _individual_payload())
        assert response.status_code == 400
        assert sms_outbox == []

    def test_register_code_is_not_accepted_for_login(self, api_client, fake_redis, sms_outbox):
        api_client.post(reverse("v1:accounts:register"), _individual_payload())
        response = api_client.post(
            reverse("v1:accounts:otp-verify"),
            {"phone": "09121111111", "code": _code(sms_outbox)},
        )
        assert response.status_code == 400
        assert response.data["error"]["code"] == "otp_invalid"

    def test_resend_is_suppressed_until_the_cooldown_ends(self, api_client, fake_redis, sms_outbox):
        api_client.post(reverse("v1:accounts:register"), _individual_payload())
        again = api_client.post(
            reverse("v1:accounts:register"),
            _individual_payload(first_name="Changed"),
        )
        assert again.status_code == 200
        assert len(sms_outbox) == 1

    def test_plaintext_code_is_not_stored(self, api_client, fake_redis, sms_outbox):
        api_client.post(reverse("v1:accounts:register"), _individual_payload())
        code = _code(sms_outbox)
        stored = fake_redis.get(build_key("accounts", "otp", "register", "09121111111"))
        assert code.encode() not in stored


@pytest.mark.django_db
class TestLoginOtp:
    def test_unknown_phone_does_not_send_or_reveal(self, api_client, fake_redis, sms_outbox):
        response = api_client.post(
            reverse("v1:accounts:otp-request"),
            {"phone": "09120000000"},
        )
        assert response.status_code == 200
        assert response.data["detail"]
        assert sms_outbox == []

    def test_inactive_user_does_not_receive_a_code(self, api_client, fake_redis, sms_outbox):
        UserFactory(phone="09124444444", is_active=False, phone_verified_at=timezone.now())
        response = api_client.post(
            reverse("v1:accounts:otp-request"),
            {"phone": "09124444444"},
        )
        assert response.status_code == 200
        assert sms_outbox == []

    def test_verified_user_and_staff_can_sign_in(self, api_client, fake_redis, sms_outbox):
        user = UserFactory(phone="09125555555", phone_verified_at=timezone.now(), token_version=4)
        requested = api_client.post(
            reverse("v1:accounts:otp-request"),
            {"phone": "۰۹۱۲۵۵۵۵۵۵۵"},
        )
        assert requested.status_code == 200
        assert sms_outbox[0]["phone"] == "09125555555"

        verified = api_client.post(
            reverse("v1:accounts:otp-verify"),
            {"phone": "09125555555", "code": _code(sms_outbox)},
        )
        assert verified.status_code == 200
        assert int(VersionedAccessToken(verified.data["access"])["tv"]) == 4

        staff = UserFactory(
            phone="09126666666",
            is_staff=True,
            phone_verified_at=timezone.now(),
        )
        api_client.post(reverse("v1:accounts:otp-request"), {"phone": staff.phone})
        staff_login = api_client.post(
            reverse("v1:accounts:otp-verify"),
            {"phone": staff.phone, "code": _code(sms_outbox)},
        )
        assert staff_login.status_code == 200
        assert staff_login.data["user"]["role"] == "admin"
        assert user.phone == "09125555555"

    def test_five_wrong_codes_invalidate_the_challenge(self, api_client, fake_redis, sms_outbox):
        UserFactory(phone="09127777777", phone_verified_at=timezone.now())
        api_client.post(reverse("v1:accounts:otp-request"), {"phone": "09127777777"})
        real = _code(sms_outbox)

        wrong_code = "000000" if real != "000000" else "000001"
        for _ in range(4):
            wrong = api_client.post(
                reverse("v1:accounts:otp-verify"),
                {"phone": "09127777777", "code": wrong_code},
            )
            assert wrong.status_code == 400
            assert wrong.data["error"]["code"] == "otp_invalid"

        blocked = api_client.post(
            reverse("v1:accounts:otp-verify"),
            {"phone": "09127777777", "code": wrong_code},
        )
        assert blocked.status_code == 400
        assert blocked.data["error"]["code"] == "otp_attempts_exceeded"

        after = api_client.post(
            reverse("v1:accounts:otp-verify"),
            {"phone": "09127777777", "code": real},
        )
        assert after.status_code == 400

    def test_deleted_code_is_expired(self, api_client, fake_redis, sms_outbox):
        UserFactory(phone="09128888888", phone_verified_at=timezone.now())
        api_client.post(reverse("v1:accounts:otp-request"), {"phone": "09128888888"})
        fake_redis.delete(build_key("accounts", "otp", "login", "09128888888"))
        response = api_client.post(
            reverse("v1:accounts:otp-verify"),
            {"phone": "09128888888", "code": _code(sms_outbox)},
        )
        assert response.status_code == 400
        assert response.data["error"]["code"] == "otp_invalid"

    def test_hourly_phone_cap(self, api_client, fake_redis, sms_outbox, settings):
        settings.OTP_PHONE_HOURLY_LIMIT = 1
        UserFactory(phone="09129999999", phone_verified_at=timezone.now())
        assert (
            api_client.post(
                reverse("v1:accounts:otp-request"),
                {"phone": "09129999999"},
            ).status_code
            == 200
        )
        limited = api_client.post(
            reverse("v1:accounts:otp-request"),
            {"phone": "09129999999"},
        )
        assert limited.status_code == 429
        other = api_client.post(
            reverse("v1:accounts:otp-request"),
            {"phone": "09120000000"},
        )
        assert other.status_code == 200

    def test_hourly_ip_cap_counts_unknown_numbers(self, api_client, fake_redis, settings):
        settings.OTP_IP_HOURLY_LIMIT = 1
        assert (
            api_client.post(
                reverse("v1:accounts:otp-request"),
                {"phone": "09120000001"},
            ).status_code
            == 200
        )
        limited = api_client.post(
            reverse("v1:accounts:otp-request"),
            {"phone": "09120000002"},
        )
        assert limited.status_code == 429
