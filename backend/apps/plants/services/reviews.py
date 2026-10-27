"""Staff review workflows for household branches and solar plants."""

from __future__ import annotations

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from apps.plants.models import Branch, BranchStatus, Plant, PlantStatus


@transaction.atomic
def review_branch(*, branch: Branch, reviewer: User, decision: str, reason: str = "") -> Branch:
    branch = Branch.objects.select_for_update().get(pk=branch.pk)
    if branch.status != BranchStatus.PENDING:
        raise ValidationError({"detail": "Only pending branches can be reviewed."})

    approved = decision == "approved"
    branch.status = BranchStatus.ACTIVE if approved else BranchStatus.INACTIVE
    branch.reviewed_at = timezone.now()
    branch.reviewed_by = reviewer
    branch.review_decision = decision
    branch.review_note = "" if approved else reason
    branch.save(
        update_fields=[
            "status",
            "reviewed_at",
            "reviewed_by",
            "review_decision",
            "review_note",
            "updated_at",
        ]
    )

    if not approved:
        Plant.objects.filter(branch=branch).update(
            status=PlantStatus.PENDING,
            reviewed_at=None,
            reviewed_by=None,
            review_decision="",
            review_note="",
            updated_at=timezone.now(),
        )
    return branch


@transaction.atomic
def review_plant(*, plant: Plant, reviewer: User, decision: str, reason: str = "") -> Plant:
    plant = Plant.objects.select_for_update().select_related("branch").get(pk=plant.pk)
    if plant.status != PlantStatus.PENDING:
        raise ValidationError({"detail": "Only pending plants can be reviewed."})
    if decision == "approved" and plant.branch.status != BranchStatus.ACTIVE:
        raise ValidationError({"branch": "The attached branch must be approved first."})

    approved = decision == "approved"
    plant.status = PlantStatus.ACTIVE if approved else PlantStatus.INACTIVE
    plant.reviewed_at = timezone.now()
    plant.reviewed_by = reviewer
    plant.review_decision = decision
    plant.review_note = "" if approved else reason
    plant.save(
        update_fields=[
            "status",
            "reviewed_at",
            "reviewed_by",
            "review_decision",
            "review_note",
            "updated_at",
        ]
    )
    return plant
