from __future__ import annotations

from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.catalog.models import Equipment
from apps.catalog.tests.factories import EquipmentFactory


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.django_db
class TestEquipmentPermissions:
    def test_only_staff_can_write(self, api_client):
        url = reverse("v1:catalog:equipment-list-create")
        payload = {
            "name": "Panel 550W",
            "category": "panel",
            "brand": "Sun",
            "power_watts": 550,
            "price_toman": 3_000_000,
            "price_mode": "per_unit",
            "units_per_kwp": "2.000",
        }
        assert api_client.post(url, payload, format="json").status_code == 401

        api_client.force_authenticate(user=UserFactory())
        assert api_client.post(url, payload, format="json").status_code == 403

        item = EquipmentFactory()
        detail = reverse("v1:catalog:equipment-detail", kwargs={"uuid": item.uuid})
        assert api_client.patch(detail, {"is_active": False}, format="json").status_code == 403
        assert api_client.delete(detail).status_code == 403

    def test_public_cannot_read_inactive_or_deleted_items(self, api_client):
        active = EquipmentFactory()
        inactive = EquipmentFactory(is_active=False)
        deleted = EquipmentFactory()
        deleted.delete()

        listed = api_client.get(reverse("v1:catalog:equipment-list-create"))
        assert listed.status_code == 200
        assert [row["uuid"] for row in listed.json()["results"]] == [str(active.uuid)]
        detail = reverse("v1:catalog:equipment-detail", kwargs={"uuid": inactive.uuid})
        assert api_client.get(detail).status_code == 404
        detail = reverse("v1:catalog:equipment-detail", kwargs={"uuid": deleted.uuid})
        assert api_client.get(detail).status_code == 404


@pytest.mark.django_db
class TestEquipmentMainPath:
    def test_staff_create_list_update_deactivate_and_soft_delete(self, api_client):
        staff = UserFactory(is_staff=True)
        api_client.force_authenticate(user=staff)
        list_url = reverse("v1:catalog:equipment-list-create")
        created = api_client.post(
            list_url,
            {
                "name": "Panel 550W",
                "category": "panel",
                "brand": "Sun",
                "power_watts": 550,
                "price_toman": 3_000_000,
                "price_mode": "per_unit",
                "units_per_kwp": "2.000",
                "show_in_price_list": True,
            },
            format="json",
        )
        assert created.status_code == 201
        item_uuid = created.json()["uuid"]
        assert created.json()["price_toman"] == 3_000_000
        assert created.json()["units_per_kwp"] == 2.0

        listed = api_client.get(list_url)
        assert listed.status_code == 200
        assert listed.json()["count"] == 1

        detail = reverse("v1:catalog:equipment-detail", kwargs={"uuid": item_uuid})
        patched = api_client.patch(
            detail, {"price_toman": 3_500_000, "is_active": False}, format="json"
        )
        assert patched.status_code == 200
        assert patched.json()["price_toman"] == 3_500_000
        assert patched.json()["is_active"] is False
        assert api_client.get(detail).status_code == 200

        api_client.force_authenticate(user=None)
        assert api_client.get(detail).status_code == 404
        api_client.force_authenticate(user=staff)
        assert api_client.delete(detail).status_code == 204
        assert Equipment.objects.filter(uuid=item_uuid).count() == 0
        assert Equipment.all_objects.filter(uuid=item_uuid).count() == 1

    def test_price_mode_requires_matching_units(self, api_client):
        api_client.force_authenticate(user=UserFactory(is_staff=True))
        url = reverse("v1:catalog:equipment-list-create")
        payload = {
            "name": "Panel",
            "category": "panel",
            "price_toman": 100_000,
            "price_mode": "per_unit",
        }
        assert api_client.post(url, payload, format="json").status_code == 400
        payload["units_per_kwp"] = "2.000"
        response = api_client.post(url, payload, format="json")
        assert response.status_code == 201
        detail = reverse("v1:catalog:equipment-detail", kwargs={"uuid": response.json()["uuid"]})
        assert api_client.patch(detail, {"price_mode": "fixed"}, format="json").status_code == 400
        changed = api_client.patch(
            detail, {"price_mode": "fixed", "units_per_kwp": None}, format="json"
        )
        assert changed.status_code == 200

    def test_public_catalog_filters_active_price_list(self, api_client):
        EquipmentFactory(show_in_price_list=True)
        EquipmentFactory(show_in_price_list=False)
        EquipmentFactory(is_active=False)
        url = reverse("v1:catalog:equipment-list-create")
        assert api_client.get(url).json()["count"] == 2
        assert api_client.get(url, {"show_in_price_list": "true"}).json()["count"] == 1


@pytest.mark.django_db
class TestEquipmentEstimate:
    def test_staff_price_change_updates_public_estimate(self, api_client):
        item = EquipmentFactory(category="cabling", price_mode="fixed", price_toman=100_000)
        estimate_url = reverse("v1:catalog:equipment-estimate")
        detail_url = reverse("v1:catalog:equipment-detail", kwargs={"uuid": item.uuid})

        before = api_client.get(estimate_url, {"capacity_kwp": "3"})
        assert before.json()["total_toman"] == 100_000

        api_client.force_authenticate(user=UserFactory(is_staff=True))
        changed = api_client.patch(detail_url, {"price_toman": 150_000}, format="json")
        assert changed.status_code == 200
        api_client.force_authenticate(user=None)

        after = api_client.get(estimate_url, {"capacity_kwp": "3"})
        assert after.json()["total_toman"] == 150_000

    def test_estimate_uses_first_panel_inverter_and_all_other_active_items(self, api_client):
        first_panel = EquipmentFactory(
            name="First panel",
            category="panel",
            price_mode="per_unit",
            units_per_kwp=Decimal("2.000"),
            price_toman=3_000_000,
        )
        EquipmentFactory(category="panel", price_mode="fixed", price_toman=99_000_000)
        EquipmentFactory(category="inverter", price_mode="fixed", price_toman=5_000_000)
        EquipmentFactory(category="inverter", price_mode="fixed", price_toman=99_000_000)
        EquipmentFactory(category="cabling", price_mode="per_kwp", price_toman=200_001)
        EquipmentFactory(category="mounting", price_mode="fixed", price_toman=500_000)
        EquipmentFactory(
            category="battery", price_mode="fixed", price_toman=99_000_000, is_active=False
        )

        response = api_client.get(
            reverse("v1:catalog:equipment-estimate"), {"capacity_kwp": "2.501"}
        )
        assert response.status_code == 200
        body = response.json()
        assert body["capacity_kwp"] == 2.501
        assert len(body["items"]) == 4
        assert body["items"][0]["equipment_uuid"] == str(first_panel.uuid)
        assert body["items"][0]["quantity"] == 6
        assert body["items"][0]["total_toman"] == 18_000_000
        assert body["items"][2]["total_toman"] == 500_203
        assert body["total_toman"] == 24_000_203

    def test_invalid_capacity_is_rejected(self, api_client):
        url = reverse("v1:catalog:equipment-estimate")
        assert api_client.get(url).status_code == 400
        assert api_client.get(url, {"capacity_kwp": "0"}).status_code == 400
        assert api_client.get(url, {"capacity_kwp": "NaN"}).status_code == 400
