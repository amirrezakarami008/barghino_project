"""API lifecycle regressions, using Django's isolated PostgreSQL test database."""

from tempfile import TemporaryDirectory
from uuid import uuid4

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import IndividualProfile, User
from apps.catalog.models import SellPlan
from apps.contracts.models import Contract
from apps.plants.models import Branch, Plant


def url(name, uuid=None):
    return reverse(f"v1:{name}", kwargs={"uuid": uuid} if uuid else None)


class ContractLifecycleTests(APITestCase):
    def setUp(self):
        media = TemporaryDirectory()
        self.addCleanup(media.cleanup)
        self.enterContext(self.settings(MEDIA_ROOT=media.name))
        self.user = User.objects.create_user(phone="09120000001", account_type="individual")
        self.user.phone_verified_at = timezone.now()
        self.user.save(update_fields=["phone_verified_at"])
        IndividualProfile.objects.create(
            user=self.user, first_name="Test", last_name="Seller", national_id="4421488623"
        )
        self.staff = User.objects.create_user(phone="09120000002", is_staff=True)
        self.plan = SellPlan.objects.create(
            name="Lifecycle test", commitment_kwh="100.500", rate_toman_per_kwh="10.250"
        )

    def test_registration_through_approval(self):
        self.check_lifecycle("approved", "active")

    def test_registration_through_rejection(self):
        self.check_lifecycle("rejected", "cancelled")

    def test_former_staff_without_identity_is_not_a_complete_customer(self):
        user = User.objects.create_user(phone="09120000009")
        self.client.force_authenticate(user)
        result = self.client.get(reverse("v1:accounts:me"))
        assert result.status_code == 200
        assert result.data["identity_profile_completion"]["is_complete"] is False
        assert "account_type" in result.data["identity_profile_completion"]["missing_fields"]

    def test_rejected_site_can_be_corrected_and_resubmitted(self):
        self.client.force_authenticate(self.user)
        branch = self.client.post(
            url("plants:branch-list-create"),
            {
                "name": "Home",
                "meter_number": str(uuid4()),
                "address": "Original",
            },
        )
        self.client.force_authenticate(self.staff)
        target = url("plants:branch-review", branch.data["uuid"])
        assert self.client.post(target, {"decision": "rejected"}).status_code == 400
        rejected = self.client.post(target, {"decision": "rejected", "reason": "Correct address"})
        assert rejected.status_code == 200
        assert rejected.data["status"] == "inactive"
        self.client.force_authenticate(self.user)
        corrected = self.client.patch(
            url("plants:branch-detail", branch.data["uuid"]),
            {
                "address": "Corrected",
            },
        )
        assert corrected.status_code == 200
        assert corrected.data["status"] == "pending"
        assert corrected.data["review_note"] == ""
        self.client.force_authenticate(self.staff)
        assert self.client.post(target, {"decision": "approved"}).status_code == 200

    def test_missing_identity_or_unaccepted_terms_do_not_sign(self):
        from apps.contracts.services.drafts import create_contract_draft

        branch = Branch.objects.create(
            owner=self.user, name="Home", meter_number=str(uuid4()), address="Test", status="active"
        )
        plant = Plant.objects.create(
            owner=self.user,
            branch=branch,
            name="Roof",
            address="Test",
            capacity_kwp="5.500",
            status="active",
        )
        draft = create_contract_draft(
            owner=self.user, plant_uuid=plant.uuid, plan_uuid=self.plan.uuid
        )
        self.client.force_authenticate(self.user)
        body = {
            "accepted_terms": False,
            "terms_version": "test-only",
            "terms_sha256": "a" * 64,
            "signature_file_uuid": str(uuid4()),
        }
        assert self.client.post(url("contracts:contract-sign", draft.uuid), body).status_code == 400
        body["accepted_terms"] = True
        IndividualProfile.objects.filter(user=self.user).delete()
        result = self.client.post(url("contracts:contract-sign", draft.uuid), body)
        assert result.status_code == 400
        draft.refresh_from_db()
        assert draft.status == "draft"
        assert draft.signed_at is None
        assert draft.history.count() == 0

    def check_lifecycle(self, decision, expected):
        client, user, staff, plan = APIClient(), self.user, self.staff, self.plan
        client.force_authenticate(user)
        branch = client.post(
            url("plants:branch-list-create"),
            {
                "name": "Home",
                "meter_number": str(uuid4()),
                "address": "Test address",
                "status": "active",
            },
            format="json",
        )
        assert branch.status_code == 201
        assert branch.data["status"] == "pending"
        plant = client.post(
            url("plants:plant-list-create"),
            {
                "branch_uuid": branch.data["uuid"],
                "name": "Rooftop",
                "address": "Test roof",
                "capacity_kwp": "5.500",
                "status": "active",
            },
            format="json",
        )
        assert plant.status_code == 201
        assert plant.data["status"] == "pending"
        body = {"plant_uuid": plant.data["uuid"], "plan_uuid": str(plan.uuid)}
        assert client.post(url("contracts:contract-list-create"), body).status_code == 400
        assert (
            client.post(
                url("plants:branch-review", branch.data["uuid"]),
                {
                    "decision": "approved",
                },
            ).status_code
            == 403
        )
        client.force_authenticate(staff)
        assert (
            client.post(
                url("plants:plant-review", plant.data["uuid"]),
                {
                    "decision": "approved",
                },
            ).status_code
            == 400
        )
        assert (
            client.post(
                url("plants:branch-review", branch.data["uuid"]),
                {
                    "decision": "approved",
                },
            ).status_code
            == 200
        )
        assert (
            client.post(
                url("plants:plant-review", plant.data["uuid"]),
                {
                    "decision": "approved",
                },
            ).status_code
            == 200
        )
        client.force_authenticate(user)
        draft = client.post(url("contracts:contract-list-create"), body)
        assert draft.status_code == 201
        assert draft.data["status"] == "draft"
        evidence = client.post(
            url("files:list-create"),
            {
                "file": SimpleUploadedFile("signature.png", b"test-only-evidence", "image/png"),
                "purpose": "contract",
                "visibility": "private",
            },
            format="multipart",
        )
        assert evidence.status_code == 201
        # This document digest is a test fixture, never a production document.
        sign_body = {
            "accepted_terms": True,
            "terms_version": "test-fixture-v1",
            "terms_sha256": "a" * 64,
            "signature_file_uuid": evidence.data["uuid"],
        }
        signed = client.post(url("contracts:contract-sign", draft.data["uuid"]), sign_body)
        assert signed.status_code == 200
        assert signed.data["status"] == "pending"
        assert signed.data["history"][0]["event_type"] == "signed"
        assert (
            client.post(url("contracts:contract-sign", draft.data["uuid"]), sign_body).status_code
            == 400
        )
        assert client.delete(url("files:detail", evidence.data["uuid"])).status_code == 400
        client.force_authenticate(staff)
        review = {
            "decision": decision,
            "reason": "Test rejection" if decision == "rejected" else "",
        }
        result = client.post(url("contracts:contract-review", draft.data["uuid"]), review)
        assert result.status_code == 200
        assert result.data["status"] == expected
        assert result.data["history"][-1]["event_type"] == decision
        assert (
            client.post(url("contracts:contract-review", draft.data["uuid"]), review).status_code
            == 404
        )
        IndividualProfile.objects.filter(user=user).update(first_name="Changed")
        Plant.objects.filter(uuid=plant.data["uuid"]).update(name="Changed roof")
        Branch.objects.filter(uuid=branch.data["uuid"]).update(address="Changed address")
        client.force_authenticate(user)
        historical = client.get(url("contracts:contract-detail", draft.data["uuid"]))
        assert historical.data["seller_identity"]["first_name"] == "Test"
        assert historical.data["plant_name"] == "Rooftop"
        assert historical.data["branch_address"] == "Test address"
        client.force_authenticate(User.objects.create_user(phone="09120000003"))
        assert client.get(url("contracts:contract-detail", draft.data["uuid"])).status_code == 404
        assert Contract.objects.get(uuid=draft.data["uuid"]).status == expected
