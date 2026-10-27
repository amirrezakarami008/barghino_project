import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.services.sessions import issue_token_pair
from apps.accounts.tests.factories import UserFactory
from apps.accounts.tokens import VersionedAccessToken, VersionedRefreshToken


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
class TestJWTAuth:
    def test_logout_blacklists_refresh_and_denylists_access(self, api_client, fake_redis):
        user = UserFactory()
        tokens = issue_token_pair(user)

        logout = api_client.post(
            reverse("v1:accounts:logout"),
            {"refresh": tokens["refresh"]},
            HTTP_AUTHORIZATION=f"Bearer {tokens['access']}",
        )
        assert logout.status_code == 200

        refresh = api_client.post(
            reverse("v1:accounts:token-refresh"),
            {"refresh": tokens["refresh"]},
        )
        assert refresh.status_code == 401

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        me = api_client.get(reverse("v1:accounts:me"))
        assert me.status_code == 401

    def test_access_carries_token_version(self):
        user = UserFactory(token_version=3)
        tokens = issue_token_pair(user)
        access = VersionedRefreshToken(tokens["refresh"]).access_token
        parsed = VersionedAccessToken(tokens["access"])
        assert int(parsed["tv"]) == 3
        assert access["tv"] == 3


@pytest.mark.django_db
class TestMe:
    def test_me_requires_authentication(self, api_client):
        response = api_client.get(reverse("v1:accounts:me"))

        assert response.status_code == 401

    def test_me_returns_current_user(self, api_client):
        user = UserFactory()
        api_client.force_authenticate(user=user)

        response = api_client.get(reverse("v1:accounts:me"))

        assert response.status_code == 200
        assert response.data["phone"] == user.phone
        assert response.data["role"] == "user"
        assert response.data["email"] == user.email

    def test_me_cannot_patch_email(self, api_client):
        user = UserFactory(email="a@example.com")
        api_client.force_authenticate(user=user)

        response = api_client.patch(
            reverse("v1:accounts:me"),
            {"email": "b@example.com", "first_name": "Ada"},
        )
        assert response.status_code == 200
        user.refresh_from_db()
        assert user.email == "a@example.com"
        assert user.first_name == "Ada"
