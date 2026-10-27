from copy import deepcopy
from decimal import Decimal
from importlib import import_module
from types import SimpleNamespace

import pytest
from django.apps import apps
from django.core.exceptions import ValidationError
from django.db import IntegrityError, connection, transaction

from apps.catalog.models import SellPlan
from apps.catalog.seed_data import PLACEHOLDER_SELL_PLANS
from apps.catalog.services.plans import create_plan, snapshot_plan_terms, update_plan
from apps.catalog.tests.factories import SellPlanFactory


@pytest.mark.django_db
def test_snapshot_is_independent_of_later_plan_edits():
    plan = SellPlanFactory()
    plan.refresh_from_db()
    snapshot = snapshot_plan_terms(plan)
    original = deepcopy(snapshot)
    update_plan(
        plan=plan,
        data={
            "name": "Updated",
            "commitment_kwh": Decimal("500"),
            "rate_toman_per_kwh": Decimal("20"),
        },
    )
    assert snapshot == original
    assert snapshot["plan_uuid"] == str(plan.uuid)
    assert snapshot["commitment_kwh"] == Decimal("100.500")
    assert snapshot["rate_toman_per_kwh"] == Decimal("10.250")


@pytest.mark.django_db
@pytest.mark.parametrize("value", ["", {}, [1], [" "]])
def test_model_validates_benefits(value):
    plan = SellPlanFactory.build(benefits=value)
    with pytest.raises(ValidationError):
        plan.full_clean()


@pytest.mark.django_db
@pytest.mark.parametrize("field", ["commitment_kwh", "rate_toman_per_kwh"])
def test_database_rejects_non_positive_terms(field):
    plan = SellPlanFactory()
    with pytest.raises(IntegrityError), transaction.atomic():
        SellPlan.objects.filter(pk=plan.pk).update(**{field: 0})


@pytest.mark.django_db
def test_service_validates_terms_without_serializer():
    from rest_framework.exceptions import ValidationError as APIValidationError

    with pytest.raises(APIValidationError):
        create_plan(data={"name": "Invalid", "commitment_kwh": 0, "rate_toman_per_kwh": 1})


@pytest.mark.django_db
def test_placeholder_seed_is_present_idempotent_and_preserves_staff_edits():
    names = [row["name"] for row in PLACEHOLDER_SELL_PLANS]
    seeded = SellPlan.all_objects.filter(name__in=names).order_by("sort_order")
    assert list(seeded.values_list("name", flat=True)) == names
    assert list(seeded.values_list("sort_order", flat=True)) == [1, 2, 3]
    assert seeded.filter(is_recommended=True).count() == 1
    assert not seeded.filter(is_active=True).exists()
    assert all("PLACEHOLDER" in row.description for row in seeded)

    plan = seeded.first()
    plan.rate_toman_per_kwh = Decimal("25")
    plan.save()
    plan.delete()
    seed = import_module("apps.catalog.migrations.0003_seed_sell_plans").seed_sell_plans
    seed(apps, SimpleNamespace(connection=connection))
    seed(apps, SimpleNamespace(connection=connection))
    assert SellPlan.all_objects.filter(name__in=names).count() == 3
    plan.refresh_from_db()
    assert plan.rate_toman_per_kwh == Decimal("25")
    assert plan.is_deleted
