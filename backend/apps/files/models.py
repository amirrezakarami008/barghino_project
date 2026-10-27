"""Persisted uploads with ownership and soft delete."""

from __future__ import annotations

from pathlib import PurePosixPath

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class FilePurpose(models.TextChoices):
    DOCUMENT = "document", "Document"
    NATIONAL_ID = "national_id", "National ID"
    CONTRACT = "contract", "Contract"
    INSTALL_MEDIA = "install_media", "Install media"
    AVATAR = "avatar", "Avatar"
    CONTENT = "content", "Content"
    OTHER = "other", "Other"


class FileVisibility(models.TextChoices):
    PRIVATE = "private", "Private"
    PUBLIC = "public", "Public"


def stored_file_upload_to(instance: StoredFile, filename: str) -> str:
    """Build a non-guessable object key under the owning user."""
    safe_name = PurePosixPath(filename).name.replace("\x00", "")[:180] or "file"
    owner_key = getattr(instance.owner, "uuid", None) or "anonymous"
    return f"files/{owner_key}/{instance.uuid}/{safe_name}"


class StoredFile(BaseModel):
    """A single uploaded blob owned by a user.

    ``uuid`` is the only public identifier. The underlying storage key is never
    exposed in API payloads.
    """

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stored_files",
    )
    file = models.FileField(upload_to=stored_file_upload_to, max_length=512)
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=128)
    size_bytes = models.PositiveBigIntegerField()
    purpose = models.CharField(
        max_length=32,
        choices=FilePurpose.choices,
        default=FilePurpose.OTHER,
        db_index=True,
    )
    visibility = models.CharField(
        max_length=16,
        choices=FileVisibility.choices,
        default=FileVisibility.PRIVATE,
        db_index=True,
    )

    class Meta:
        verbose_name = "stored file"
        verbose_name_plural = "stored files"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "purpose", "-created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(purpose__in=FilePurpose.values),
                name="files_storedfile_purpose_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(visibility__in=FileVisibility.values),
                name="files_storedfile_visibility_valid",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.original_name} ({self.uuid})"
