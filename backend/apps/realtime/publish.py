"""Sync publishers for HTTP views and Celery tasks."""

from __future__ import annotations

import logging
from typing import Any

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings

from apps.realtime.groups import user_group

logger = logging.getLogger(__name__)

# Channel-layer event type → consumer handler ``realtime_notification``.
_NOTIFICATION_TYPE = "realtime.notification"


def publish_to_group(group: str, event: str, data: dict[str, Any] | None = None) -> bool:
    """Broadcast ``{event, data}`` to a channel-layer group.

    Returns ``False`` (no-op) when websockets are disabled or the layer is missing.
    """
    if not getattr(settings, "USE_WEBSOCKETS", False):
        logger.debug("publish_to_group skipped (USE_WEBSOCKETS=False): %s %s", group, event)
        return False

    channel_layer = get_channel_layer()
    if channel_layer is None:
        logger.debug("publish_to_group skipped (no channel layer): %s %s", group, event)
        return False

    async_to_sync(channel_layer.group_send)(
        group,
        {
            "type": _NOTIFICATION_TYPE,
            "event": event,
            "data": data or {},
        },
    )
    return True


def publish_to_user(user_id: int | str, event: str, data: dict[str, Any] | None = None) -> bool:
    """Send an event to the personal group of ``user_id``."""
    return publish_to_group(user_group(user_id), event, data)
