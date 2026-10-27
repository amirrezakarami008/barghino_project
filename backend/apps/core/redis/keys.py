"""Namespaced Redis key builder."""

from __future__ import annotations

from django.conf import settings


def build_key(*parts: str | int) -> str:
    """Build ``{REDIS_KEY_PREFIX}:part:part`` skipping empty segments."""
    prefix = getattr(settings, "REDIS_KEY_PREFIX", "backend")
    segments = [str(prefix)]
    for part in parts:
        text = str(part).strip()
        if text:
            segments.append(text)
    return ":".join(segments)
