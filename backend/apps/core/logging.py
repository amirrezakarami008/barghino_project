"""Logging filters that redact secrets from log records."""

from __future__ import annotations

import logging
import re

_BEARER_RE = re.compile(r"(Bearer\s+)(\S+)", re.IGNORECASE)
_TOKEN_QUERY_RE = re.compile(r"([?&]token=)([^&\s]+)", re.IGNORECASE)
_SENSITIVE_KEYS = frozenset(
    {
        "password",
        "token",
        "access",
        "refresh",
        "authorization",
        "secret",
        "api_key",
    }
)


def _redact_text(text: str) -> str:
    text = _BEARER_RE.sub(r"\1[REDACTED]", text)
    text = _TOKEN_QUERY_RE.sub(r"\1[REDACTED]", text)
    return text


class SensitiveDataFilter(logging.Filter):
    """Redact Bearer tokens and ``token=`` query params in log messages/args."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = _redact_text(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {
                    k: ("[REDACTED]" if str(k).lower() in _SENSITIVE_KEYS else _maybe_redact(v))
                    for k, v in record.args.items()
                }
            elif isinstance(record.args, tuple):
                record.args = tuple(_maybe_redact(a) for a in record.args)
        return True


def _maybe_redact(value: object) -> object:
    if isinstance(value, str):
        return _redact_text(value)
    return value
