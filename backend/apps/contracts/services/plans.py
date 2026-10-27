"""Select current plan terms for a draft contract."""

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.catalog.models import SellPlan
from apps.catalog.services.plans import snapshot_plan_terms
from apps.contracts.models import Contract, ContractStatus
from apps.contracts.selectors import contract_for_plan_selection, plan_for_selection


@transaction.atomic
def select_plan_for_contract(*, contract: Contract, plan: SellPlan) -> Contract:
    if contract.pk is None or plan.pk is None:
        raise ValidationError("Save the contract and plan before selecting terms.")
    current_contract = contract_for_plan_selection(contract_id=contract.pk)
    if current_contract is None:
        raise ValidationError("Contract is not available.")
    if current_contract.status != ContractStatus.DRAFT:
        raise ValidationError("Plan selection is only allowed on draft contracts.")
    current_plan = plan_for_selection(plan_id=plan.pk)
    if current_plan is None:
        raise ValidationError("Only active, non-deleted plans can be selected.")

    terms = snapshot_plan_terms(current_plan)
    current_contract.plan = current_plan
    current_contract.plan_name = terms["plan_name"]
    current_contract.commitment_kwh = terms["commitment_kwh"]
    current_contract.rate_toman_per_kwh = terms["rate_toman_per_kwh"]
    current_contract.save(
        update_fields=["plan", "plan_name", "commitment_kwh", "rate_toman_per_kwh", "updated_at"]
    )
    return current_contract
