"""Staff writes to the equipment catalog."""

from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError

from apps.catalog.models import Equipment


def _save_equipment(item: Equipment) -> Equipment:
    try:
        item.full_clean()
        item.save()
    except DjangoValidationError as exc:
        raise ValidationError(exc.message_dict) from exc
    except IntegrityError as exc:
        raise ValidationError("Equipment could not be saved.") from exc
    return item


@transaction.atomic
def create_equipment(*, data: dict) -> Equipment:
    return _save_equipment(Equipment(**data))


@transaction.atomic
def update_equipment(*, item: Equipment, data: dict) -> Equipment:
    for field, value in data.items():
        setattr(item, field, value)
    return _save_equipment(item)


def soft_delete_equipment(*, item: Equipment) -> None:
    if not item.is_deleted:
        item.delete()
