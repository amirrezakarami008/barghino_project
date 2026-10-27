"""Create a draft electricity purchase contract for an approved plant."""

from __future__ import annotations

from uuid import UUID

from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError

from apps.accounts.models import User
from apps.catalog.models import SellPlan
from apps.contracts.models import Contract
from apps.contracts.services.plans import select_plan_for_contract
from apps.plants.models import Branch, BranchStatus, Plant, PlantStatus


@transaction.atomic
def create_contract_draft(*, owner: User, plant_uuid: UUID, plan_uuid: UUID) -> Contract:
    branch = (
        Branch.objects.select_for_update()
        .filter(owner=owner, plants__uuid=plant_uuid, plants__owner=owner)
        .first()
    )
    if branch is None:
        raise NotFound("Plant not found.", code="plant_not_found")

    plant = (
        Plant.objects.select_for_update()
        .filter(uuid=plant_uuid, owner=owner, branch=branch)
        .first()
    )
    if plant is None:
        raise NotFound("Plant not found.", code="plant_not_found")
    if branch.status != BranchStatus.ACTIVE:
        raise ValidationError(
            {"branch": "The attached branch must be approved before creating a contract."},
            code="branch_not_approved",
        )
    if plant.status != PlantStatus.ACTIVE:
        raise ValidationError(
            {"plant": "The plant must be approved before creating a contract."},
            code="plant_not_approved",
        )

    plan = SellPlan.objects.filter(uuid=plan_uuid, is_active=True).first()
    if plan is None:
        raise ValidationError({"plan": "Select an active plan."}, code="plan_not_available")

    contract = Contract.objects.create(owner=owner, plant=plant)
    return select_plan_for_contract(contract=contract, plan=plan)
