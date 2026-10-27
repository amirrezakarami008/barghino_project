"""Create a stored file from an uploaded blob."""

from __future__ import annotations

import mimetypes

from django.core.files.uploadedfile import UploadedFile
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.accounts.models import User
from apps.files.models import FilePurpose, FileVisibility, StoredFile
from apps.files.validators import validate_upload


@transaction.atomic
def upload_file(
    *,
    owner: User,
    uploaded: UploadedFile,
    purpose: str = FilePurpose.OTHER,
    visibility: str = FileVisibility.PRIVATE,
    acting_user: User | None = None,
) -> StoredFile:
    actor = acting_user or owner
    if visibility == FileVisibility.PUBLIC and not actor.is_staff:
        raise PermissionDenied(
            detail="Only staff can mark uploads as public.",
            code="public_upload_forbidden",
        )

    original_name = (getattr(uploaded, "name", None) or "file").replace("\x00", "")[:255]
    if not original_name:
        raise ValidationError({"file": "A file name is required."}, code="invalid_filename")

    content_type = _resolve_content_type(uploaded, original_name)
    size_bytes = int(getattr(uploaded, "size", 0) or 0)
    validate_upload(purpose=purpose, content_type=content_type, size_bytes=size_bytes)

    stored = StoredFile(
        owner=owner,
        original_name=original_name,
        content_type=content_type,
        size_bytes=size_bytes,
        purpose=purpose,
        visibility=visibility,
    )
    # uuid is set on init so upload_to can place the object under a stable key.
    stored.file = uploaded
    stored.save()
    return stored


def _resolve_content_type(uploaded: UploadedFile, original_name: str) -> str:
    raw = (getattr(uploaded, "content_type", None) or "").split(";")[0].strip().lower()
    if raw and raw not in {"application/octet-stream", "binary/octet-stream"}:
        return raw
    guessed, _ = mimetypes.guess_type(original_name)
    return (guessed or raw or "application/octet-stream").lower()
