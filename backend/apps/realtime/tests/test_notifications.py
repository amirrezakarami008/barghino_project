from __future__ import annotations

import pytest
from asgiref.sync import sync_to_async
from channels.testing import WebsocketCommunicator

from apps.accounts.tests.factories import UserFactory
from apps.accounts.tokens import VersionedRefreshToken
from apps.realtime.consumers.base import WS_CLOSE_UNAUTHORIZED
from apps.realtime.publish import publish_to_user
from config.asgi import application


@pytest.fixture
def inmemory_channel_layer(settings):
    settings.CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }
    from channels import layers

    layers.channel_layers = layers.ChannelLayerManager()
    yield
    layers.channel_layers = layers.ChannelLayerManager()


def _access_token_for(user) -> str:
    return str(VersionedRefreshToken.for_user(user).access_token)


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_notifications_reject_missing_token(inmemory_channel_layer, fake_redis):
    communicator = WebsocketCommunicator(application, "/ws/notifications/")
    connected, code = await communicator.connect()
    assert connected is False
    assert code == WS_CLOSE_UNAUTHORIZED
    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_notifications_reject_querystring_token(inmemory_channel_layer, fake_redis):
    user = await sync_to_async(UserFactory)()
    token = await sync_to_async(_access_token_for)(user)
    communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected, code = await communicator.connect()
    assert connected is False
    assert code == WS_CLOSE_UNAUTHORIZED
    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_notifications_ping_pong_via_subprotocol(inmemory_channel_layer, fake_redis):
    user = await sync_to_async(UserFactory)()
    token = await sync_to_async(_access_token_for)(user)

    communicator = WebsocketCommunicator(
        application,
        "/ws/notifications/",
        subprotocols=["bearer", token],
    )
    connected, _ = await communicator.connect()
    assert connected is True

    welcome = await communicator.receive_json_from()
    assert welcome["type"] == "connected"
    assert welcome["data"]["user_id"] == user.pk

    await communicator.send_json_to({"type": "ping", "data": {"n": 1}})
    pong = await communicator.receive_json_from()
    assert pong == {"type": "pong", "data": {"n": 1}}

    await sync_to_async(publish_to_user)(user.pk, "order.created", {"id": "42"})
    pushed = await communicator.receive_json_from()
    assert pushed == {"type": "order.created", "data": {"id": "42"}}

    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_notifications_via_authorization_header(inmemory_channel_layer, fake_redis):
    user = await sync_to_async(UserFactory)()
    token = await sync_to_async(_access_token_for)(user)

    communicator = WebsocketCommunicator(
        application,
        "/ws/notifications/",
        headers=[(b"authorization", f"Bearer {token}".encode())],
    )
    connected, _ = await communicator.connect()
    assert connected is True
    welcome = await communicator.receive_json_from()
    assert welcome["type"] == "connected"
    await communicator.disconnect()
