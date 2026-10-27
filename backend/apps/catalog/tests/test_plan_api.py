from __future__ import annotations

import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.catalog.models import SellPlan
from apps.catalog.tests.factories import SellPlanFactory


@pytest.fixture(autouse=True)
def empty_catalog(db):
    SellPlan.all_objects.all().hard_delete()
    cache.clear()


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


def _payload(**overrides) -> dict:
    return {
        "name": "New plan",
        "description": "Test plan",
        "commitment_kwh": 100.5,
        "rate_toman_per_kwh": 10.25,
        "savings_text": "Test copy",
        "benefits": ["Test benefit"],
        "sort_order": 1,
        **overrides,
    }


def _detail(plan: SellPlan) -> str:
    return reverse("v1:catalog:plans-detail", kwargs={"uuid": plan.uuid})


@pytest.mark.django_db
class TestSellPlanPermissions:
    @pytest.mark.parametrize("authenticated", [False, True])
    def test_only_staff_can_write(self, api_client, authenticated):
        if authenticated:
            api_client.force_authenticate(user=UserFactory())
        plan = SellPlanFactory()
        expected = 403 if authenticated else 401
        url = reverse("v1:catalog:plans-list-create")
        assert api_client.post(url, _payload(), format="json").status_code == expected
        assert api_client.patch(_detail(plan), {"is_active": False}).status_code == expected
        assert api_client.put(_detail(plan), _payload(), format="json").status_code == expected
        assert api_client.delete(_detail(plan)).status_code == expected

    def test_public_visibility_and_staff_inactive_access(self, api_client):
        active = SellPlanFactory()
        inactive = SellPlanFactory(is_active=False)
        deleted = SellPlanFactory()
        deleted.delete()
        url = reverse("v1:catalog:plans-list-create")

        response = api_client.get(url)
        assert response.status_code == 200
        assert [row["uuid"] for row in response.json()["results"]] == [str(active.uuid)]
        assert api_client.get(_detail(active)).status_code == 200
        assert api_client.get(_detail(inactive)).status_code == 404
        assert api_client.get(_detail(deleted)).status_code == 404
        assert api_client.get(url, {"is_active": "false"}).json()["count"] == 0

        api_client.force_authenticate(user=UserFactory(is_staff=True))
        assert api_client.get(url).json()["count"] == 2
        assert api_client.get(_detail(inactive)).status_code == 200
        assert api_client.get(_detail(deleted)).status_code == 404
        filtered = api_client.get(url, {"is_active": "false"}).json()["results"]
        assert [row["uuid"] for row in filtered] == [str(inactive.uuid)]


@pytest.mark.django_db
class TestSellPlanMainPath:
    def test_staff_create_replace_deactivate_activate_and_soft_delete(self, api_client):
        staff = UserFactory(is_staff=True)
        api_client.force_authenticate(user=staff)
        url = reverse("v1:catalog:plans-list-create")
        created = api_client.post(url, _payload(), format="json")
        assert created.status_code == 201
        body = created.json()
        assert body["commitment_kwh"] == 100.5
        assert body["rate_toman_per_kwh"] == 10.25
        assert body["benefits"] == ["Test benefit"]
        assert api_client.get(url).json()["count"] == 1
        plan = SellPlan.objects.get(uuid=body["uuid"])

        replaced = api_client.put(_detail(plan), _payload(name="Replaced"), format="json")
        assert replaced.status_code == 200
        assert replaced.json()["name"] == "Replaced"
        assert api_client.patch(_detail(plan), {"is_active": False}).status_code == 200
        api_client.force_authenticate(user=None)
        assert api_client.get(_detail(plan)).status_code == 404
        assert api_client.get(url).json()["count"] == 0

        api_client.force_authenticate(user=staff)
        assert api_client.patch(_detail(plan), {"is_active": True}).status_code == 200
        assert api_client.delete(_detail(plan)).status_code == 204
        assert not SellPlan.objects.filter(uuid=plan.uuid).exists()
        assert SellPlan.all_objects.filter(uuid=plan.uuid, deleted_at__isnull=False).exists()

    def test_ordering_and_recommended_filter(self, api_client):
        last = SellPlanFactory(sort_order=3)
        first = SellPlanFactory(sort_order=1)
        middle = SellPlanFactory(sort_order=2, is_recommended=True)
        url = reverse("v1:catalog:plans-list-create")
        ordered = api_client.get(url).json()["results"]
        assert [row["uuid"] for row in ordered] == [str(p.uuid) for p in [first, middle, last]]
        filtered = api_client.get(url, {"is_recommended": "true"}).json()["results"]
        assert [row["uuid"] for row in filtered] == [str(middle.uuid)]
        descending = api_client.get(url, {"ordering": "-sort_order"}).json()["results"]
        assert descending[0]["uuid"] == str(last.uuid)

    @pytest.mark.parametrize("field", ["commitment_kwh", "rate_toman_per_kwh"])
    @pytest.mark.parametrize("value", [0, -1])
    def test_non_positive_terms_rejected_on_create_and_update(self, api_client, field, value):
        api_client.force_authenticate(user=UserFactory(is_staff=True))
        url = reverse("v1:catalog:plans-list-create")
        response = api_client.post(url, _payload(**{field: value}), format="json")
        assert response.status_code == 400
        assert field in response.json()["error"]["detail"]
        plan = SellPlanFactory()
        response = api_client.patch(_detail(plan), {field: value}, format="json")
        assert response.status_code == 400

    @pytest.mark.parametrize("value", ["benefit", {}, [1], [True], [""], ["  "], [["x"]], None])
    def test_invalid_benefits_rejected(self, api_client, value):
        api_client.force_authenticate(user=UserFactory(is_staff=True))
        response = api_client.post(
            reverse("v1:catalog:plans-list-create"), _payload(benefits=value), format="json"
        )
        assert response.status_code == 400
        assert "benefits" in response.json()["error"]["detail"]

    def test_duplicate_name_including_deleted_plan_rejected(self, api_client):
        api_client.force_authenticate(user=UserFactory(is_staff=True))
        plan = SellPlanFactory(name="Reserved")
        url = reverse("v1:catalog:plans-list-create")
        assert api_client.post(url, _payload(name="Reserved"), format="json").status_code == 400
        plan.delete()
        assert api_client.post(url, _payload(name="Reserved"), format="json").status_code == 400
