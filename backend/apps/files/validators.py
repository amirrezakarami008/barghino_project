"""Upload purpose rules: MIME allow-list and size caps."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass

from django.conf import settings
from rest_framework.exceptions import ValidationError

# Defaults mirror docs/BACKEND_BACKLOG.md P0.3 (documents + install media).
_DEFAULT_RULES: dict[str, dict] = {
    "document": {
        "max_bytes": 10 * 1024 * 1024,
        "content_types": (
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
        ),
    },
    "national_id": {
        "max_bytes": 10 * 1024 * 1024,
        "content_types": (
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
        ),
    },
    "contract": {
        "max_bytes": 15 * 1024 * 1024,
        "content_types": (
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
        ),
    },
    "install_media": {
        "max_bytes": 25 * 1024 * 1024,
        "content_types": (
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/webm",
        ),
    },
    "avatar": {
        "max_bytes": 2 * 1024 * 1024,
        "content_types": (
            "image/jpeg",
            "image/png",
            "image/webp",
        ),
    },
    "content": {
        "max_bytes": 10 * 1024 * 1024,
        "content_types": (
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        ),
    },
    "other": {
        "max_bytes": 10 * 1024 * 1024,
        "content_types": (
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
        ),
    },
}


@dataclass(frozen=True, slots=True)
class UploadRule:
    max_bytes: int
    content_types: frozenset[str]


def get_upload_rules() -> Mapping[str, UploadRule]:
    configured = getattr(settings, "FILES_UPLOAD_RULES", None) or _DEFAULT_RULES
    rules: dict[str, UploadRule] = {}
    for purpose, raw in configured.items():
        rules[purpose] = UploadRule(
            max_bytes=int(raw["max_bytes"]),
            content_types=frozenset(raw["content_types"]),
        )
    return rules


def validate_upload(*, purpose: str, content_type: str, size_bytes: int) -> None:
    rules = get_upload_rules()
    rule = rules.get(purpose)
    if rule is None:
        raise ValidationError(
            {"purpose": "Unsupported file purpose."},
            code="invalid_purpose",
        )
    normalized_type = (content_type or "").split(";")[0].strip().lower()
    if normalized_type not in rule.content_types:
        raise ValidationError(
            {
                "file": (
                    f"Content type '{normalized_type or 'unknown'}' is not allowed "
                    f"for purpose '{purpose}'."
                )
            },
            code="invalid_content_type",
        )
    if size_bytes <= 0:
        raise ValidationError({"file": "Empty files are not allowed."}, code="empty_file")
    if size_bytes > rule.max_bytes:
        raise ValidationError(
            {"file": (f"File exceeds the {rule.max_bytes} byte limit for purpose '{purpose}'.")},
            code="file_too_large",
        )
