from __future__ import annotations

from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.plants.models import Branch, Plant
from apps.plants.tests.factories import BranchFactory, PlantFactory


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.django_db
class TestBranchPermissions:
    def test_requires_authentication(self, api_client):
        response = api_client.get(reverse("v1:plants:branch-list-create"))
        assert response.status_code == 401

    def test_other_user_cannot_access(self, api_client):
        owner = UserFactory()
        other = UserFactory()
        branch = BranchFactory(owner=owner)

        api_client.force_authenticate(user=other)
        detail = reverse("v1:plants:branch-detail", kwargs={"uuid": branch.uuid})
        assert api_client.get(detail).status_code == 404
        assert api_client.patch(detail, {"name": "X"}).status_code == 404
        assert api_client.delete(detail).status_code == 404


@pytest.mark.django_db
class TestBranchMainPath:
    def test_create_list_update_and_soft_delete(self, api_client):
        user = UserFactory()
        api_client.force_authenticate(user=user)

        create = api_client.post(
            reverse("v1:plants:branch-list-create"),
            {
                "name": "Home",
                "meter_number": "1234567890",
                "address": "Tehran, Valiasr",
                "status": "active",
            },
            format="json",
        )
        assert create.status_code == 201
        body = create.json()
        assert body["meter_number"] == "1234567890"
        assert body["status"] == "active"
        branch_uuid = body["uuid"]

        listed = api_client.get(reverse("v1:plants:branch-list-create"))
        assert listed.status_code == 200
        assert listed.json()["count"] == 1

        patched = api_client.patch(
            reverse("v1:plants:branch-detail", kwargs={"uuid": branch_uuid}),
            {"name": "Home updated"},
            format="json",
        )
        assert patched.status_code == 200
        assert patched.json()["name"] == "Home updated"

        deleted = api_client.delete(
            reverse("v1:plants:branch-detail", kwargs={"uuid": branch_uuid})
        )
        assert deleted.status_code == 204
        assert Branch.objects.filter(uuid=branch_uuid).count() == 0
        assert Branch.all_objects.filter(uuid=branch_uuid).count() == 1

    def test_meter_number_must_be_unique(self, api_client):
        BranchFactory(meter_number="DUP-001")
        user = UserFactory()
        api_client.force_authenticate(user=user)

        response = api_client.post(
            reverse("v1:plants:branch-list-create"),
            {
                "name": "Other",
                "meter_number": "DUP-001",
                "address": "Addr",
            },
            format="json",
        )
        assert response.status_code == 400

    def test_cannot_delete_branch_with_plants(self, api_client):
        plant = PlantFactory()
        api_client.force_authenticate(user=plant.owner)

        response = api_client.delete(
            reverse("v1:plants:branch-detail", kwargs={"uuid": plant.branch.uuid})
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestPlantPermissions:
    def test_other_user_cannot_access(self, api_client):
        plant = PlantFactory()
        other = UserFactory()
        api_client.force_authenticate(user=other)
        detail = reverse("v1:plants:plant-detail", kwargs={"uuid": plant.uuid})
        assert api_client.get(detail).status_code == 404
        assert api_client.delete(detail).status_code == 404

    def test_cannot_attach_to_someone_elses_branch(self, api_client):
        foreign_branch = BranchFactory()
        user = UserFactory()
        api_client.force_authenticate(user=user)

        response = api_client.post(
            reverse("v1:plants:plant-list-create"),
            {
                "branch_uuid": str(foreign_branch.uuid),
                "name": "Mine",
                "address": "Addr",
                "capacity_kwp": 3.2,
            },
            format="json",
        )
        assert response.status_code == 404


@pytest.mark.django_db
class TestPlantMainPath:
    def test_create_list_update_and_soft_delete(self, api_client):
        user = UserFactory()
        branch = BranchFactory(owner=user)
        api_client.force_authenticate(user=user)

        create = api_client.post(
            reverse("v1:plants:plant-list-create"),
            {
                "branch_uuid": str(branch.uuid),
                "name": "Rooftop",
                "address": "Tehran rooftop",
                "capacity_kwp": 8.25,
                "status": "active",
                "commissioned_at": "2024-06-01",
            },
            format="json",
        )
        assert create.status_code == 201
        body = create.json()
        assert body["branch_uuid"] == str(branch.uuid)
        assert body["capacity_kwp"] == 8.25
        assert body["status"] == "active"
        plant_uuid = body["uuid"]

        listed = api_client.get(reverse("v1:plants:plant-list-create"))
        assert listed.status_code == 200
        assert listed.json()["count"] == 1

        patched = api_client.patch(
            reverse("v1:plants:plant-detail", kwargs={"uuid": plant_uuid}),
            {"capacity_kwp": "9.000"},
            format="json",
        )
        assert patched.status_code == 200
        assert Decimal(str(patched.json()["capacity_kwp"])) == Decimal("9.000")

        deleted = api_client.delete(reverse("v1:plants:plant-detail", kwargs={"uuid": plant_uuid}))
        assert deleted.status_code == 204
        assert Plant.objects.filter(uuid=plant_uuid).count() == 0
        assert Plant.all_objects.filter(uuid=plant_uuid).count() == 1

    def test_rejects_non_positive_capacity(self, api_client):
        user = UserFactory()
        branch = BranchFactory(owner=user)
        api_client.force_authenticate(user=user)

        response = api_client.post(
            reverse("v1:plants:plant-list-create"),
            {
                "branch_uuid": str(branch.uuid),
                "name": "Bad",
                "address": "Addr",
                "capacity_kwp": 0,
            },
            format="json",
        )
        assert response.status_code == 400
