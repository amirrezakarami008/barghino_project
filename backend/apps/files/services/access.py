"""Build time-limited or authenticated access URLs for stored files."""

from __future__ import annotations

from datetime import timedelta
from typing import Any
from urllib.parse import urljoin

from django.conf import settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.request import Request

from apps.files.models import FileVisibility, StoredFile


def uses_signed_object_storage() -> bool:
    """True when default storage is S3-compatible."""
    backend = settings.STORAGES.get("default", {}).get("BACKEND", "")
    return backend.endswith("S3Storage") or backend.endswith("s3boto3.S3Boto3Storage")


def build_access_url(stored: StoredFile, *, request: Request | None = None) -> str:
    """Return a URL the client can use to fetch file bytes.

    Private local files always go through the authenticated content API so
    ``/media/`` paths are never the access path. Public files and S3 objects
    may use storage URLs (signed when configured).
    """
    if stored.visibility == FileVisibility.PRIVATE and not uses_signed_object_storage():
        return _absolute_content_url(stored, request=request)

    if uses_signed_object_storage() and stored.visibility == FileVisibility.PRIVATE:
        return _signed_storage_url(stored)

    storage_url = stored.file.storage.url(stored.file.name)
    if storage_url.startswith(("http://", "https://")):
        return storage_url
    return _absolute_from_path(storage_url, request=request)


def _signed_storage_url(stored: StoredFile) -> str:
    storage = stored.file.storage
    expire = int(getattr(settings, "FILES_SIGNED_URL_TTL_SECONDS", 300))
    try:
        return storage.url(stored.file.name, expire=expire)
    except TypeError:
        return storage.url(stored.file.name)


def access_url_expires_at(stored: StoredFile) -> str | None:
    if stored.visibility == FileVisibility.PUBLIC:
        return None
    ttl = int(getattr(settings, "FILES_SIGNED_URL_TTL_SECONDS", 300))
    return (timezone.now() + timedelta(seconds=ttl)).isoformat()


def _absolute_content_url(stored: StoredFile, *, request: Request | None) -> str:
    path = reverse("v1:files:content", kwargs={"uuid": stored.uuid})
    return _absolute_from_path(path, request=request)


def _absolute_from_path(path: str, *, request: Request | None) -> str:
    if path.startswith(("http://", "https://")):
        return path
    if request is not None:
        return request.build_absolute_uri(path)
    base = getattr(settings, "FILES_PUBLIC_BASE_URL", "") or ""
    if base:
        return urljoin(base.rstrip("/") + "/", path.lstrip("/"))
    return path


def open_file_for_download(stored: StoredFile) -> Any:
    return stored.file.open("rb")
