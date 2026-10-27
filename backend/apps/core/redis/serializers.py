"""Value serialization for RedisService."""

from __future__ import annotations

import json
from typing import Any


def serialize(value: Any) -> bytes:
    """Encode a Python value for Redis.

    Non-bytes values are JSON-encoded (so strings like ``\"42\"`` stay strings).
    Raw ``bytes`` are stored as-is.
    """
    if isinstance(value, bytes):
        return value
    return json.dumps(value, separators=(",", ":"), default=str).encode("utf-8")


def deserialize(data: bytes | None) -> Any:
    if data is None:
        return None
    try:
        return json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return data
