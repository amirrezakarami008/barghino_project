"""Read queries for branches and plants."""

from __future__ import annotations

from uuid import UUID

from django.db.models import QuerySet

from apps.accounts.models import User
from apps.plants.models import Branch, Plant


def branches_for_user(user: User) -> QuerySet[Branch]:
    return Branch.objects.filter(owner=user).select_related("owner", "reviewed_by")


def get_owned_branch(*, user: User, branch_uuid: UUID) -> Branch | None:
    return Branch.objects.filter(uuid=branch_uuid, owner=user).first()


def plants_for_user(user: User) -> QuerySet[Plant]:
    return Plant.objects.filter(owner=user).select_related("owner", "branch", "reviewed_by")


def get_owned_plant(*, user: User, plant_uuid: UUID) -> Plant | None:
    return Plant.objects.filter(uuid=plant_uuid, owner=user).select_related("branch").first()


def branch_has_alive_plants(branch: Branch) -> bool:
    return Plant.objects.filter(branch=branch).exists()


def meter_number_taken(meter_number: str, *, exclude_uuid: UUID | None = None) -> bool:
    qs = Branch.objects.filter(meter_number=meter_number)
    if exclude_uuid is not None:
        qs = qs.exclude(uuid=exclude_uuid)
    return qs.exists()
