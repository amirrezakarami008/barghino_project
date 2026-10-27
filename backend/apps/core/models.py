"""
Abstract base models. Inherit from these in every app instead of
`models.Model` so all tables share the same conventions.
"""

from __future__ import annotations

import uuid
from typing import Any

from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Adds `created_at` / `updated_at` to a model."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class UUIDModel(models.Model):
    """Adds a non-editable public UUID next to the integer primary key.

    Use `uuid` in URLs and API payloads instead of exposing sequential ids.
    """

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)

    class Meta:
        abstract = True


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self) -> tuple[int, dict[str, int]]:
        """Soft-delete every row in the queryset."""
        count = self.update(deleted_at=timezone.now())
        return count, {self.model._meta.label: count}

    def hard_delete(self) -> tuple[int, dict[str, int]]:
        return super().delete()

    def alive(self) -> SoftDeleteQuerySet:
        return self.filter(deleted_at__isnull=True)

    def dead(self) -> SoftDeleteQuerySet:
        return self.filter(deleted_at__isnull=False)

    def restore(self) -> int:
        return self.update(deleted_at=None)


class SoftDeleteManager(models.Manager.from_queryset(SoftDeleteQuerySet)):
    """Default manager: hides soft-deleted rows."""

    def get_queryset(self) -> SoftDeleteQuerySet:
        return SoftDeleteQuerySet(self.model, using=self._db).alive()


class SoftDeleteAllManager(models.Manager.from_queryset(SoftDeleteQuerySet)):
    """Unfiltered manager (alive + deleted). Use for admin / recovery."""

    def get_queryset(self) -> SoftDeleteQuerySet:
        return SoftDeleteQuerySet(self.model, using=self._db)


class SoftDeleteModel(models.Model):
    """Soft-delete mixin: ``delete()`` sets ``deleted_at`` instead of removing the row."""

    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = SoftDeleteManager()
    all_objects = SoftDeleteAllManager()

    class Meta:
        abstract = True

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    def delete(self, using: Any = None, keep_parents: bool = False) -> tuple[int, dict[str, int]]:
        self.deleted_at = timezone.now()
        # Full save so TimeStampedModel.updated_at (auto_now) refreshes when present.
        self.save()
        return 1, {self._meta.label: 1}

    def hard_delete(
        self,
        using: Any = None,
        keep_parents: bool = False,
    ) -> tuple[int, dict[str, int]]:
        return super().delete(using=using, keep_parents=keep_parents)

    def restore(self) -> None:
        self.deleted_at = None
        self.save()


class BaseModel(SoftDeleteModel, TimeStampedModel, UUIDModel):
    """Recommended default base for concrete models."""

    class Meta(TimeStampedModel.Meta):
        abstract = True
