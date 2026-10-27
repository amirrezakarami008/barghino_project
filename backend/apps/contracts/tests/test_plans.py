from decimal import Decimal

import pytest
from django.db.models.deletion import ProtectedError
from rest_framework.exceptions import ValidationError

from apps.catalog.services.plans import soft_delete_plan, update_plan
from apps.catalog.tests.factories import SellPlanFactory
from apps.contracts.models import ContractStatus
from apps.contracts.services.plans import select_plan_for_contract
from apps.contracts.tests.factories import ContractFactory


@pytest.mark.django_db
def test_contract_persists_selected_terms_after_staff_changes_plan():
    plan = SellPlanFactory()
    contract = ContractFactory()
    selected = select_plan_for_contract(contract=contract, plan=plan)
    update_plan(
        plan=plan,
        data={
            "name": "New name",
            "commitment_kwh": Decimal("900"),
            "rate_toman_per_kwh": Decimal("90"),
        },
    )
    contract.refresh_from_db()
    assert selected.pk == contract.pk
    assert contract.plan_id == plan.pk
    assert contract.plan_name != plan.name
    assert contract.commitment_kwh == Decimal("100.500")
    assert contract.rate_toman_per_kwh == Decimal("10.250")

    soft_delete_plan(plan=plan)
    contract.refresh_from_db()
    assert contract.plan_id == plan.pk
    assert contract.rate_toman_per_kwh == Decimal("10.250")
    with pytest.raises(ProtectedError):
        plan.hard_delete()


@pytest.mark.django_db
@pytest.mark.parametrize("unavailable", ["inactive", "deleted"])
def test_contract_rejects_unavailable_plan_even_with_stale_caller_instance(unavailable):
    plan = SellPlanFactory()
    stale = type(plan).objects.get(pk=plan.pk)
    if unavailable == "inactive":
        update_plan(plan=plan, data={"is_active": False})
    else:
        soft_delete_plan(plan=plan)
    contract = ContractFactory()
    with pytest.raises(ValidationError):
        select_plan_for_contract(contract=contract, plan=stale)
    contract.refresh_from_db()
    assert contract.plan_id is None
    assert contract.commitment_kwh is None
    assert contract.rate_toman_per_kwh is None


@pytest.mark.django_db
def test_contract_cannot_change_plan_after_leaving_draft():
    contract = ContractFactory()
    first = SellPlanFactory()
    select_plan_for_contract(contract=contract, plan=first)
    contract.refresh_from_db()
    contract.status = ContractStatus.ACTIVE
    contract.save(update_fields=["status"])
    with pytest.raises(ValidationError):
        select_plan_for_contract(contract=contract, plan=SellPlanFactory())
    contract.refresh_from_db()
    assert contract.plan_id == first.pk


@pytest.mark.django_db
def test_draft_can_choose_a_different_plan():
    contract = ContractFactory()
    select_plan_for_contract(contract=contract, plan=SellPlanFactory())
    replacement = SellPlanFactory(commitment_kwh=Decimal("200"), rate_toman_per_kwh=Decimal("15"))
    select_plan_for_contract(contract=contract, plan=replacement)
    contract.refresh_from_db()
    assert contract.plan_id == replacement.pk
    assert contract.commitment_kwh == Decimal("200")
    assert contract.rate_toman_per_kwh == Decimal("15")
