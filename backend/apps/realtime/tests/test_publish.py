from __future__ import annotations

import pytest

from apps.realtime.publish import publish_to_group, publish_to_user


@pytest.fixture
def inmemory_channel_layer(settings):
    settings.CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }
    from channels import layers

    layers.channel_layers = layers.ChannelLayerManager()
    yield
    layers.channel_layers = layers.ChannelLayerManager()


def test_publish_noop_when_websockets_disabled(settings):
    settings.USE_WEBSOCKETS = False
    assert publish_to_user(1, "x", {"a": 1}) is False
    assert publish_to_group("g", "x", {}) is False


def test_publish_to_group_with_inmemory(settings, inmemory_channel_layer):
    settings.USE_WEBSOCKETS = True
    assert publish_to_group("room_1", "ping", {"ok": True}) is True
