from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.plants.models import Plant
from apps.plants.tests.factories import BranchFactory, PlantFactory


@pytest.fixture
def staff_client():
    client = APIClient()
    client.force_authenticate(user=UserFactory(is_staff=True))
    return client


@pytest.mark.django_db
class TestStaffInventory:
    def test_staff_lists_all_owners_and_default_pending_queue_is_preserved(self, staff_client):
        pending = PlantFactory()
        active = PlantFactory(status="active")
        url = reverse("v1:plants:plant-review-queue")
        assert staff_client.get(url).json()["count"] == 1
        result = staff_client.get(url, {"status": "all"}).json()
        assert {row["uuid"] for row in result["results"]} == {str(pending.uuid), str(active.uuid)}
        assert staff_client.get(url, {"status": "active"}).json()["count"] == 1

    def test_regular_user_cannot_manage_staff_inventory(self):
        plant = PlantFactory()
        client = APIClient()
        client.force_authenticate(user=plant.owner)
        url = reverse("v1:plants:plant-review-queue")
        detail = reverse("v1:plants:staff-plant-detail", kwargs={"uuid": plant.uuid})
        assert client.get(url, {"status": "all"}).status_code == 403
        assert client.post(url, {}, format="json").status_code == 403
        assert client.get(detail).status_code == 403
        assert client.patch(detail, {"name": "Changed"}, format="json").status_code == 403
        assert client.delete(detail).status_code == 403

    def test_create_uses_branch_owner_and_cannot_force_approval(self, staff_client):
        branch = BranchFactory()
        response = staff_client.post(
            reverse("v1:plants:plant-review-queue"),
            {
                "branch_uuid": str(branch.uuid),
                "name": "Staff plant",
                "address": "Address",
                "capacity_kwp": "6.125",
                "status": "active",
                "owner_uuid": "ignored",
            },
            format="json",
        )
        assert response.status_code == 201
        plant = Plant.objects.get(uuid=response.json()["uuid"])
        assert plant.owner == branch.owner
        assert plant.capacity_kwp == Decimal("6.125")
        assert plant.status == "pending"

    def test_update_requeues_and_delete_is_soft(self, staff_client):
        plant = PlantFactory(status="active")
        detail = reverse("v1:plants:staff-plant-detail", kwargs={"uuid": plant.uuid})
        result = staff_client.patch(detail, {"name": "Changed"}, format="json")
        assert result.status_code == 200
        assert result.json()["status"] == "pending"
        assert staff_client.delete(detail).status_code == 204
        assert not Plant.objects.filter(pk=plant.pk).exists()
        assert Plant.all_objects.get(pk=plant.pk).is_deleted
        assert staff_client.get(detail).status_code == 404

    def test_update_cannot_move_plant_between_owners(self, staff_client):
        plant = PlantFactory()
        branch = BranchFactory()
        detail = reverse("v1:plants:staff-plant-detail", kwargs={"uuid": plant.uuid})
        assert (
            staff_client.patch(detail, {"branch_uuid": str(branch.uuid)}, format="json").status_code
            == 404
        )
        plant.refresh_from_db()
        assert plant.branch != branch

    def test_branch_inventory_and_owner_filter(self, staff_client):
        branch = BranchFactory()
        BranchFactory(status="pending")
        url = reverse("v1:plants:branch-review-queue")
        assert staff_client.get(url).json()["count"] == 1
        result = staff_client.get(url, {"status": "all", "owner_uuid": str(branch.owner.uuid)})
        assert result.status_code == 200
        assert result.json()["count"] == 1
        assert result.json()["results"][0]["uuid"] == str(branch.uuid)

    def test_filters_and_capacity_are_validated(self, staff_client):
        url = reverse("v1:plants:plant-review-queue")
        assert staff_client.get(url, {"status": "unknown"}).status_code == 400
        branch = BranchFactory()
        result = staff_client.post(
            url,
            {"branch_uuid": str(branch.uuid), "name": "Bad", "address": "A", "capacity_kwp": "0"},
            format="json",
        )
        assert result.status_code == 400

    def test_review_requires_approved_branch_and_rejection_reason(self, staff_client):
        branch = BranchFactory(status="pending")
        plant = PlantFactory(branch=branch)
        review = reverse("v1:plants:plant-review", kwargs={"uuid": plant.uuid})
        assert staff_client.post(review, {"decision": "approved"}, format="json").status_code == 400
        assert staff_client.post(review, {"decision": "rejected"}, format="json").status_code == 400
        result = staff_client.post(
            review, {"decision": "rejected", "reason": "Correct the meter data"}, format="json"
        )
        assert result.status_code == 200
        assert result.json()["status"] == "inactive"
        assert result.json()["review_note"] == "Correct the meter data"

    def test_staff_can_approve_pending_plant_once(self, staff_client):
        plant = PlantFactory()
        review = reverse("v1:plants:plant-review", kwargs={"uuid": plant.uuid})
        result = staff_client.post(review, {"decision": "approved"}, format="json")
        assert result.status_code == 200
        assert result.json()["status"] == "active"
        assert staff_client.post(review, {"decision": "approved"}, format="json").status_code == 404

    def test_inventory_search_runs_server_side(self, staff_client):
        PlantFactory(name="Solar North")
        PlantFactory(name="Solar South")
        result = staff_client.get(
            reverse("v1:plants:plant-review-queue"), {"status": "all", "search": "North"}
        )
        assert result.status_code == 200
        assert result.json()["count"] == 1
        assert result.json()["results"][0]["name"] == "Solar North"
