"""Staff writes and immutable terms for electricity sell plans."""

from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError

from apps.catalog.models import SellPlan


def _save_plan(plan: SellPlan) -> SellPlan:
    try:
        plan.full_clean()
        plan.save()
    except DjangoValidationError as exc:
        raise ValidationError(exc.message_dict) from exc
    except IntegrityError as exc:
        raise ValidationError("Plan could not be saved; its name must be unique.") from exc
    return plan


@transaction.atomic
def create_plan(*, data: dict) -> SellPlan:
    return _save_plan(SellPlan(**data))


@transaction.atomic
def update_plan(*, plan: SellPlan, data: dict) -> SellPlan:
    for field, value in data.items():
        setattr(plan, field, value)
    return _save_plan(plan)


def soft_delete_plan(*, plan: SellPlan) -> None:
    if not plan.is_deleted:
        plan.delete()


def snapshot_plan_terms(plan: SellPlan) -> dict:
    """Copy scalar terms; Decimal values retain precision and are immutable."""
    return {
        "plan_uuid": str(plan.uuid),
        "plan_name": plan.name,
        "commitment_kwh": plan.commitment_kwh,
        "rate_toman_per_kwh": plan.rate_toman_per_kwh,
    }
