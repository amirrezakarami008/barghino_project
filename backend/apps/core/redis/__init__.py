"""Domain Redis helpers — use instead of wiring redis-py by hand."""

from __future__ import annotations

from typing import Any

from apps.core.redis.client import RedisService
from apps.core.redis.connections import connection_manager
from apps.core.redis.keys import build_key


def get_redis(connection: str = "default") -> RedisService:
    """Return a :class:`RedisService` bound to a named connection."""
    return RedisService(connection, manager=connection_manager)


class _LazyRedisClient:
    """Module-level DX alias that delegates to ``get_redis('default')``."""

    def __getattr__(self, name: str) -> Any:
        return getattr(get_redis("default"), name)


redis_client = _LazyRedisClient()

__all__ = [
    "RedisService",
    "build_key",
    "connection_manager",
    "get_redis",
    "redis_client",
]
