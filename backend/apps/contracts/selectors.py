"""Locked reads used during atomic plan selection."""

from apps.accounts.models import User
from apps.catalog.models import SellPlan
from apps.contracts.models import Contract, ContractStatus


def contracts_for_user(user: User):
    return (
        Contract.objects.filter(owner=user)
        .select_related(
            "owner__individual_profile",
            "owner__legal_profile",
            "plant__branch",
            "plan",
            "signature_file",
        )
        .prefetch_related("history")
        .order_by("-created_at")
    )


def get_owned_contract(*, user: User, contract_uuid) -> Contract | None:
    return contracts_for_user(user).filter(uuid=contract_uuid).first()


def contract_for_plan_selection(*, contract_id: int) -> Contract | None:
    return Contract.objects.select_for_update().filter(pk=contract_id).first()


def plan_for_selection(*, plan_id: int) -> SellPlan | None:
    return SellPlan.objects.select_for_update().filter(pk=plan_id, is_active=True).first()


def contracts_awaiting_company_review():
    return (
        Contract.objects.filter(status=ContractStatus.PENDING, review_decision="")
        .select_related(
            "owner__individual_profile",
            "owner__legal_profile",
            "plant__branch",
            "plan",
            "signature_file",
        )
        .prefetch_related("history")
        .order_by("signed_at", "created_at")
    )
