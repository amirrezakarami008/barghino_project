"""Soft-delete a stored file."""

from __future__ import annotations

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.contracts.models import Contract
from apps.files.models import StoredFile


@transaction.atomic
def soft_delete_file(stored: StoredFile) -> StoredFile:
    """Hide the file from APIs. Blob remains until hard delete / cleanup."""
    stored = StoredFile.objects.select_for_update().get(pk=stored.pk)
    if Contract.all_objects.filter(signature_file_id=stored.pk).exists():
        raise ValidationError(
            {"detail": "A file used as signed contract evidence cannot be deleted."},
            code="contract_signature_file_protected",
        )
    if not stored.is_deleted:
        stored.delete()
    return stored
