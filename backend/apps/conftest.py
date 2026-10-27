"""Shared pytest fixtures."""

from __future__ import annotations

import fakeredis
import pytest

from apps.core.redis import connection_manager


@pytest.fixture(autouse=True)
def _celery_eager(settings):
    """Run Celery tasks inline so OTP SMS does not need a broker."""
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True
    from config.celery import app

    app.conf.task_always_eager = True
    app.conf.task_eager_propagates = True


@pytest.fixture
def fake_redis():
    """In-memory Redis for denylist / WS connection counters."""
    connection_manager.reset()
    client = fakeredis.FakeRedis()
    connection_manager.configure({"default": client, "streams": client})
    yield client
    connection_manager.reset()
