from unittest.mock import patch

import fakeredis
import pytest
from django.urls import reverse

from apps.core.redis import connection_manager


@pytest.fixture
def redis_ok():
    connection_manager.reset()
    connection_manager.configure({"default": fakeredis.FakeRedis()})
    yield
    connection_manager.reset()


@pytest.mark.django_db
def test_health_live(client):
    response = client.get(reverse("core:health-live"))
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.django_db
def test_health_check_returns_ok(client, redis_ok):
    response = client.get(reverse("core:health-check"))

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok", "redis": "ok"}


@pytest.mark.django_db
def test_health_ready_same_as_legacy(client, redis_ok):
    response = client.get(reverse("core:health-ready"))
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.django_db
def test_health_ready_requires_token_when_configured(client, redis_ok, settings):
    settings.HEALTH_CHECK_TOKEN = "secret-probe"
    denied = client.get(reverse("core:health-ready"))
    assert denied.status_code == 401

    ok = client.get(reverse("core:health-ready"), HTTP_X_HEALTH_TOKEN="secret-probe")
    assert ok.status_code == 200


@pytest.mark.django_db
def test_health_check_reports_redis_down(client, redis_ok):
    with patch("apps.core.views.get_redis") as mock_get:
        mock_get.return_value.ping.return_value = False
        response = client.get(reverse("core:health-check"))

    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "error"
    assert body["database"] == "ok"
    assert body["redis"] == "unavailable"
