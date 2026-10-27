"""High-level Redis facade used by application code."""

from __future__ import annotations

from typing import Any

import redis

from apps.core.redis.connections import RedisConnectionManager, connection_manager
from apps.core.redis.serializers import deserialize, serialize


class RedisService:
    """Stable API over a named Redis connection.

    Prefer this over talking to redis-py directly. Use :attr:`raw` only when
    a command is not wrapped here yet.
    """

    def __init__(
        self,
        connection: str = "default",
        *,
        manager: RedisConnectionManager | None = None,
    ) -> None:
        self._connection = connection
        self._manager = manager or connection_manager

    @property
    def connection_name(self) -> str:
        return self._connection

    @property
    def raw(self) -> redis.Redis:
        """Underlying redis-py client. Escape hatch — prefer facade methods."""
        return self._manager.get(self._connection)

    def using(self, name: str) -> RedisService:
        return RedisService(name, manager=self._manager)

    def ping(self) -> bool:
        return self._manager.ping(self._connection)

    # ------------------------------------------------------------------ KV
    def get(self, key: str) -> Any:
        return deserialize(self.raw.get(key))

    def set(self, key: str, value: Any, *, ttl: int | None = None) -> bool:
        payload = serialize(value)
        if ttl is not None:
            return bool(self.raw.set(key, payload, ex=ttl))
        return bool(self.raw.set(key, payload))

    def delete(self, *keys: str) -> int:
        if not keys:
            return 0
        return int(self.raw.delete(*keys))

    def exists(self, key: str) -> bool:
        return bool(self.raw.exists(key))

    def expire(self, key: str, ttl: int) -> bool:
        return bool(self.raw.expire(key, ttl))

    def ttl(self, key: str) -> int:
        """Seconds until expiry. ``-1`` means no expiry, ``-2`` means missing."""
        return int(self.raw.ttl(key))

    def incr(self, key: str, amount: int = 1) -> int:
        return int(self.raw.incrby(key, amount))

    # ---------------------------------------------------------------- Hash
    def hset(self, key: str, mapping: dict[str, Any]) -> int:
        fields: dict[str | bytes, bytes] = {}
        for field, value in mapping.items():
            field_key: str | bytes = field if isinstance(field, (str, bytes)) else str(field)
            fields[field_key] = serialize(value)
        return int(self.raw.hset(key, mapping=fields))

    def hget(self, key: str, field: str) -> Any:
        return deserialize(self.raw.hget(key, field))

    def hgetall(self, key: str) -> dict[str, Any]:
        raw = self.raw.hgetall(key)
        result: dict[str, Any] = {}
        for field, value in raw.items():
            name = field.decode("utf-8") if isinstance(field, bytes) else str(field)
            result[name] = deserialize(value)
        return result

    def hdel(self, key: str, *fields: str) -> int:
        if not fields:
            return 0
        return int(self.raw.hdel(key, *fields))

    # ------------------------------------------------------------- Streams
    def xadd(
        self,
        stream: str,
        fields: dict[str, Any],
        *,
        maxlen: int | None = None,
        id: str = "*",
    ) -> str:
        encoded = {
            (k if isinstance(k, (str, bytes)) else str(k)): serialize(v) for k, v in fields.items()
        }
        kwargs: dict[str, Any] = {}
        if maxlen is not None:
            kwargs["maxlen"] = maxlen
            kwargs["approximate"] = True
        entry_id = self.raw.xadd(stream, encoded, id=id, **kwargs)
        return entry_id.decode("utf-8") if isinstance(entry_id, bytes) else str(entry_id)

    def xread(
        self,
        streams: dict[str, str],
        *,
        count: int | None = None,
        block: int | None = None,
    ) -> list[tuple[str, list[tuple[str, dict[str, Any]]]]]:
        raw = self.raw.xread(streams, count=count, block=block)
        return self._decode_stream_result(raw)

    def xgroup_create(
        self,
        stream: str,
        group: str,
        *,
        id: str = "0",
        mkstream: bool = True,
    ) -> bool:
        try:
            return bool(self.raw.xgroup_create(stream, group, id=id, mkstream=mkstream))
        except redis.ResponseError as exc:
            if "BUSYGROUP" in str(exc):
                return False
            raise

    def xreadgroup(
        self,
        group: str,
        consumer: str,
        streams: dict[str, str],
        *,
        count: int | None = None,
        block: int | None = None,
    ) -> list[tuple[str, list[tuple[str, dict[str, Any]]]]]:
        raw = self.raw.xreadgroup(
            group,
            consumer,
            streams,
            count=count,
            block=block,
        )
        return self._decode_stream_result(raw)

    def xack(self, stream: str, group: str, *ids: str) -> int:
        if not ids:
            return 0
        return int(self.raw.xack(stream, group, *ids))

    def _decode_stream_result(
        self,
        raw: list | None,
    ) -> list[tuple[str, list[tuple[str, dict[str, Any]]]]]:
        if not raw:
            return []
        result: list[tuple[str, list[tuple[str, dict[str, Any]]]]] = []
        for stream_name, messages in raw:
            name = _as_str(stream_name)
            decoded_messages: list[tuple[str, dict[str, Any]]] = []
            for message_id, fields in messages:
                mid = _as_str(message_id)
                decoded_fields: dict[str, Any] = {}
                for field, value in fields.items():
                    payload = value if isinstance(value, bytes) else serialize(value)
                    decoded_fields[_as_str(field)] = deserialize(payload)
                decoded_messages.append((mid, decoded_fields))
            result.append((name, decoded_messages))
        return result

    # ---------------------------------------------------------------- Lock
    def acquire_lock(self, key: str, token: str, *, ttl: int) -> bool:
        return bool(self.raw.set(key, serialize(token), nx=True, ex=ttl))

    def release_lock(self, key: str, token: str) -> bool:
        """Release a lock only if ``token`` still owns it (optimistic WATCH)."""
        expected = serialize(token)
        client = self.raw
        while True:
            try:
                with client.pipeline(True) as pipe:
                    pipe.watch(key)
                    current = pipe.get(key)
                    if current != expected:
                        pipe.unwatch()
                        return False
                    pipe.multi()
                    pipe.delete(key)
                    pipe.execute()
                    return True
            except redis.WatchError:
                continue


def _as_str(value: bytes | str | Any) -> str:
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return str(value)
