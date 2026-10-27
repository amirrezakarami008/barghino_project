"""Sample user-scoped notification consumer."""

from __future__ import annotations

from typing import Any

from apps.realtime.consumers.base import BaseJsonConsumer
from apps.realtime.groups import user_group


class NotificationConsumer(BaseJsonConsumer):
    """Personal notification channel.

    Connect::

        # Browser (subprotocol — never put the JWT in the URL):
        #   new WebSocket("wss://host/ws/notifications/", ["bearer", accessJwt])
        #
        # Non-browser clients may send Authorization: Bearer <access_jwt>.

    Client can send ``{"type": "ping", "data": {}}`` and receives ``pong``.
    Server pushes via :func:`apps.realtime.publish.publish_to_user`.
    """

    async def on_connect(self) -> None:
        await self.join_group(user_group(self.scope["user"].pk))
        await self.send_event("connected", {"user_id": self.scope["user"].pk})

    async def on_event(self, event_type: str, data: dict[str, Any]) -> None:
        if event_type == "ping":
            await self.send_event("pong", data)
            return
        await super().on_event(event_type, data)

    async def realtime_notification(self, event: dict[str, Any]) -> None:
        """Channel-layer handler for ``type: realtime.notification``."""
        await self.send_event(event.get("event", "notification"), event.get("data") or {})
