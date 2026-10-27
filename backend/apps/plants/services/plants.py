"""Create, update, and soft-delete solar plants."""

from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError

from apps.accounts.models import User
from apps.plants.models import Branch, Plant, PlantStatus
from apps.plants.selectors import get_owned_branch


def _as_capacity(value) -> Decimal:
    capacity = value if isinstance(value, Decimal) else Decimal(str(value))
    if capacity <= 0:
        raise ValidationError(
            {"capacity_kwp": "Capacity must be greater than zero."},
            code="invalid_capacity",
        )
    return capacity


def _resolve_branch(*, owner: User, branch_uuid) -> Branch:
    branch = get_owned_branch(user=owner, branch_uuid=branch_uuid)
    if branch is None:
        raise NotFound(detail="Branch not found.", code="branch_not_found")
    return branch


@transaction.atomic
def create_plant(*, owner: User, data: dict) -> Plant:
    branch = _resolve_branch(owner=owner, branch_uuid=data["branch_uuid"])
    return Plant.objects.create(
        owner=owner,
        branch=branch,
        name=data["name"].strip(),
        address=data["address"].strip(),
        capacity_kwp=_as_capacity(data["capacity_kwp"]),
        commissioned_at=data.get("commissioned_at"),
        status=PlantStatus.PENDING,
    )


@transaction.atomic
def update_plant(*, plant: Plant, data: dict) -> Plant:
    changed = False
    if "branch_uuid" in data:
        branch = _resolve_branch(owner=plant.owner, branch_uuid=data["branch_uuid"])
        changed = changed or plant.branch_id != branch.pk
        plant.branch = branch
    if "name" in data:
        value = data["name"].strip()
        changed = changed or plant.name != value
        plant.name = value
    if "address" in data:
        value = data["address"].strip()
        changed = changed or plant.address != value
        plant.address = value
    if "capacity_kwp" in data:
        capacity = _as_capacity(data["capacity_kwp"])
        changed = changed or plant.capacity_kwp != capacity
        plant.capacity_kwp = capacity
    if "commissioned_at" in data:
        changed = changed or plant.commissioned_at != data["commissioned_at"]
        plant.commissioned_at = data["commissioned_at"]
    if changed:
        plant.status = PlantStatus.PENDING
        plant.reviewed_at = None
        plant.reviewed_by = None
        plant.review_decision = ""
        plant.review_note = ""
    plant.save()
    return plant


def soft_delete_plant(*, plant: Plant) -> Plant:
    if not plant.is_deleted:
        plant.delete()
    return plant
