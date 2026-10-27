"""Create, update, and soft-delete household branches."""

from __future__ import annotations

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from apps.plants.models import Branch, BranchStatus, Plant, PlantStatus
from apps.plants.selectors import branch_has_alive_plants, meter_number_taken


def _normalize_meter_number(value: str) -> str:
    return "".join(value.split())


@transaction.atomic
def create_branch(*, owner: User, data: dict) -> Branch:
    meter_number = _normalize_meter_number(data["meter_number"])
    if not meter_number:
        raise ValidationError({"meter_number": "Meter number is required."})
    if meter_number_taken(meter_number):
        raise ValidationError(
            {"meter_number": "This meter number is already registered."},
            code="meter_number_taken",
        )
    try:
        return Branch.objects.create(
            owner=owner,
            name=data["name"].strip(),
            meter_number=meter_number,
            address=data["address"].strip(),
            status=BranchStatus.PENDING,
        )
    except IntegrityError as exc:
        raise ValidationError(
            {"meter_number": "This meter number is already registered."},
            code="meter_number_taken",
        ) from exc


@transaction.atomic
def update_branch(*, branch: Branch, data: dict) -> Branch:
    changed = False
    if "name" in data:
        value = data["name"].strip()
        changed = changed or branch.name != value
        branch.name = value
    if "address" in data:
        value = data["address"].strip()
        changed = changed or branch.address != value
        branch.address = value
    if "meter_number" in data:
        meter_number = _normalize_meter_number(data["meter_number"])
        if not meter_number:
            raise ValidationError({"meter_number": "Meter number is required."})
        if meter_number_taken(meter_number, exclude_uuid=branch.uuid):
            raise ValidationError(
                {"meter_number": "This meter number is already registered."},
                code="meter_number_taken",
            )
        changed = changed or branch.meter_number != meter_number
        branch.meter_number = meter_number
    if changed:
        branch.status = BranchStatus.PENDING
        branch.reviewed_at = None
        branch.reviewed_by = None
        branch.review_decision = ""
        branch.review_note = ""
        Plant.objects.filter(branch=branch).update(
            status=PlantStatus.PENDING,
            reviewed_at=None,
            reviewed_by=None,
            review_decision="",
            review_note="",
            updated_at=timezone.now(),
        )
    try:
        branch.save()
    except IntegrityError as exc:
        raise ValidationError(
            {"meter_number": "This meter number is already registered."},
            code="meter_number_taken",
        ) from exc
    return branch


def soft_delete_branch(*, branch: Branch) -> Branch:
    if branch_has_alive_plants(branch):
        raise ValidationError(
            {"detail": ("Remove or reassign plants on this branch before deleting it.")},
            code="branch_has_plants",
        )
    if not branch.is_deleted:
        branch.delete()
    return branch
