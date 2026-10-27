"""Thread-safe named Redis connection pools."""

from __future__ import annotations

import threading

import redis
from django.conf import settings


class RedisConnectionManager:
    """Lazy, named Redis clients backed by connection pools.

    Configured via ``settings.REDIS_CONNECTIONS`` (name → URL).
    Clients can be overridden in tests with :meth:`configure`.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._clients: dict[str, redis.Redis] = {}
        self._overrides: dict[str, redis.Redis] = {}

    def _known_names(self) -> set[str]:
        configured = getattr(settings, "REDIS_CONNECTIONS", {}) or {}
        return set(configured) | set(self._overrides)

    def get(self, name: str = "default") -> redis.Redis:
        with self._lock:
            if name in self._overrides:
                return self._overrides[name]
            if name in self._clients:
                return self._clients[name]

            connections: dict[str, str] = getattr(settings, "REDIS_CONNECTIONS", {}) or {}
            if name not in connections:
                known = ", ".join(sorted(self._known_names())) or "(none)"
                raise ValueError(f"Unknown Redis connection {name!r}. Known: {known}")

            client = redis.Redis.from_url(
                connections[name],
                decode_responses=False,
            )
            self._clients[name] = client
            return client

    def configure(self, overrides: dict[str, redis.Redis]) -> None:
        """Inject clients (e.g. fakeredis) for tests. Replaces previous overrides."""
        with self._lock:
            self._overrides = dict(overrides)

    def close(self, name: str) -> None:
        with self._lock:
            client = self._clients.pop(name, None)
            self._overrides.pop(name, None)
        if client is not None:
            client.close()

    def close_all(self) -> None:
        with self._lock:
            clients = list(self._clients.values())
            self._clients.clear()
            self._overrides.clear()
        for client in clients:
            client.close()

    def reset(self) -> None:
        """Close pools and clear overrides — use between tests."""
        self.close_all()

    def ping(self, name: str = "default") -> bool:
        try:
            return bool(self.get(name).ping())
        except Exception:  # noqa: BLE001
            return False


connection_manager = RedisConnectionManager()
