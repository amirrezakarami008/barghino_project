"""Read queries for stored files."""

from __future__ import annotations

from uuid import UUID

from django.db.models import QuerySet

from apps.accounts.models import User
from apps.files.models import FileVisibility, StoredFile


def files_for_user(user: User) -> QuerySet[StoredFile]:
    return StoredFile.objects.filter(owner=user).select_related("owner")


def get_owned_or_staff_file(*, user: User, file_uuid: UUID) -> StoredFile | None:
    qs = StoredFile.objects.select_related("owner")
    if user.is_staff:
        return qs.filter(uuid=file_uuid).first()
    return qs.filter(uuid=file_uuid, owner=user).first()


def get_readable_file(*, user: User | None, file_uuid: UUID) -> StoredFile | None:
    """Owner, staff, or anyone for public files."""
    qs = StoredFile.objects.select_related("owner")
    stored = qs.filter(uuid=file_uuid).first()
    if stored is None:
        return None
    if stored.visibility == FileVisibility.PUBLIC:
        return stored
    if user is None or not user.is_authenticated:
        return None
    if user.is_staff or stored.owner_id == user.pk:
        return stored
    return None
