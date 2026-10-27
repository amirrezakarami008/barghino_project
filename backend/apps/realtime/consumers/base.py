"""Base JSON WebSocket consumer with a stable event envelope."""

from __future__ import annotations

import logging
from typing import Any

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.conf import settings
from django.contrib.auth.models import AnonymousUser

from apps.accounts.authentication import release_ws_slot, try_acquire_ws_slot

logger = logging.getLogger(__name__)

# Application-level close code (use 4000–4999 range for custom codes).
WS_CLOSE_UNAUTHORIZED = 4401
WS_CLOSE_TOO_MANY = 4429
WS_CLOSE_MESSAGE_TOO_LARGE = 4413


class BaseJsonConsumer(AsyncJsonWebsocketConsumer):
    """Authenticated JSON consumer.

    Client messages::

        {"type": "ping", "data": {}}

    Server messages::

        {"type": "pong", "data": {}}
        {"type": "error", "data": {"code": "...", "detail": "..."}}
    """

    require_auth: bool = True
    _joined_groups: set[str]
    _ws_slot_held: bool = False

    async def connect(self) -> None:
        self._joined_groups = set()
        self._ws_slot_held = False
        user = self.scope.get("user")
        if self.require_auth and (
            user is None or isinstance(user, AnonymousUser) or not user.is_authenticated
        ):
            await self.close(code=WS_CLOSE_UNAUTHORIZED)
            return

        max_conn = getattr(settings, "WS_MAX_CONNECTIONS_PER_USER", 5)
        if not await self._acquire_slot(user.pk, max_conn):
            await self.close(code=WS_CLOSE_TOO_MANY)
            return

        accepted = self.scope.get("accepted_subprotocol")
        if accepted:
            await self.accept(subprotocol=accepted)
        else:
            await self.accept()
        await self.on_connect()

    async def _acquire_slot(self, user_id: int, max_connections: int) -> bool:
        from asgiref.sync import sync_to_async

        ok = await sync_to_async(try_acquire_ws_slot)(user_id, max_connections=max_connections)
        self._ws_slot_held = ok
        return ok

    async def on_connect(self) -> None:
        """Hook for subclasses after the socket is accepted."""

    async def disconnect(self, code: int) -> None:
        for group in list(self._joined_groups):
            await self.leave_group(group)
        if self._ws_slot_held:
            user = self.scope.get("user")
            if user is not None and getattr(user, "is_authenticated", False):
                from asgiref.sync import sync_to_async

                await sync_to_async(release_ws_slot)(user.pk)
            self._ws_slot_held = False
        await self.on_disconnect(code)

    async def on_disconnect(self, code: int) -> None:
        """Hook for subclasses."""

    async def join_group(self, group: str) -> None:
        await self.channel_layer.group_add(group, self.channel_name)
        self._joined_groups.add(group)

    async def leave_group(self, group: str) -> None:
        if group in self._joined_groups:
            await self.channel_layer.group_discard(group, self.channel_name)
            self._joined_groups.discard(group)

    async def send_event(self, event_type: str, data: dict[str, Any] | None = None) -> None:
        await self.send_json({"type": event_type, "data": data or {}})

    async def send_error(self, code: str, detail: str) -> None:
        await self.send_event("error", {"code": code, "detail": detail})

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        max_bytes = getattr(settings, "WS_MAX_MESSAGE_BYTES", 64 * 1024)
        if text_data is not None and len(text_data.encode("utf-8")) > max_bytes:
            await self.close(code=WS_CLOSE_MESSAGE_TOO_LARGE)
            return
        if bytes_data is not None and len(bytes_data) > max_bytes:
            await self.close(code=WS_CLOSE_MESSAGE_TOO_LARGE)
            return
        await super().receive(text_data=text_data, bytes_data=bytes_data, **kwargs)

    async def receive_json(self, content: Any, **kwargs: Any) -> None:
        if not isinstance(content, dict):
            await self.send_error("invalid_payload", "Expected a JSON object.")
            return
        event_type = content.get("type")
        if not isinstance(event_type, str) or not event_type:
            await self.send_error("invalid_type", "Missing string field 'type'.")
            return
        data = content.get("data") or {}
        if not isinstance(data, dict):
            await self.send_error("invalid_data", "Field 'data' must be an object.")
            return
        await self.on_event(event_type, data)

    async def on_event(self, event_type: str, data: dict[str, Any]) -> None:
        """Override to handle client events. Default: ignore unknown types."""
        await self.send_error("unknown_type", f"Unknown event type: {event_type}")
