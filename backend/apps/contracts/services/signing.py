"""Seller signature and company decision workflows for contracts."""

from __future__ import annotations

from uuid import UUID

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from apps.accounts.models import AccountType, IndividualProfile, LegalProfile, User
from apps.contracts.models import Contract, ContractHistory, ContractStatus
from apps.files.models import FilePurpose, FileVisibility, StoredFile
from apps.plants.models import Branch, BranchStatus, Plant, PlantStatus


def _lock_contract_and_site(*, contract_id: int, owner_id: int | None = None) -> Contract:
    """Lock branch -> plant -> contract, matching draft creation's lock order.

    Nullable profile/plan joins must not be locked by PostgreSQL's FOR UPDATE.
    Read the site separately so deleted sites cannot be signed or approved.
    """
    scope = Contract.objects.filter(pk=contract_id)
    if owner_id is not None:
        scope = scope.filter(owner_id=owner_id)
    site = scope.values("plant_id", "plant__branch_id").first()
    if not site or not site["plant_id"] or not site["plant__branch_id"]:
        raise ValidationError({"plant": "Select an approved plant first."})
    branch = Branch.objects.select_for_update().filter(pk=site["plant__branch_id"]).first()
    if branch is None:
        raise ValidationError({"branch": "The branch is no longer available."})
    plant = Plant.objects.select_for_update().filter(pk=site["plant_id"], branch=branch).first()
    if plant is None:
        raise ValidationError({"plant": "The plant is no longer available."})
    locked = (
        scope.select_for_update(of=("self",))
        .select_related("plan", "owner__individual_profile", "owner__legal_profile")
        .get()
    )
    if locked.plant_id != plant.pk:
        raise ValidationError({"plant": "Plant information changed; reload the contract."})
    plant.branch = branch
    locked.plant = plant
    return locked


def _identity_snapshot(owner: User) -> dict | None:
    if owner.account_type == AccountType.INDIVIDUAL:
        try:
            profile = owner.individual_profile
        except IndividualProfile.DoesNotExist:
            return None
        if not profile.first_name or not profile.last_name or not profile.national_id:
            return None
        return {
            "kind": "individual",
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "national_id": profile.national_id,
        }
    if owner.account_type == AccountType.LEGAL:
        try:
            profile = owner.legal_profile
        except LegalProfile.DoesNotExist:
            return None
        required = (
            profile.company_name,
            profile.company_national_id,
            profile.representative_first_name,
            profile.representative_last_name,
            profile.representative_national_id,
        )
        if not all(required):
            return None
        return {
            "kind": "legal",
            "company_name": profile.company_name,
            "company_national_id": profile.company_national_id,
            "representative_first_name": profile.representative_first_name,
            "representative_last_name": profile.representative_last_name,
            "representative_national_id": profile.representative_national_id,
            "registration_number": profile.registration_number,
            "economic_code": profile.economic_code,
        }
    return None


def _signed_contract_snapshot(contract: Contract, identity: dict) -> dict:
    plant = contract.plant
    branch = plant.branch
    return {
        "seller": identity,
        "plant": {
            "uuid": str(plant.uuid),
            "name": plant.name,
            "capacity_kwp": str(plant.capacity_kwp),
        },
        "branch": {
            "uuid": str(branch.uuid),
            "meter_number": branch.meter_number,
            "address": branch.address,
        },
        "commercial_terms": {
            "plan_uuid": str(contract.plan.uuid) if contract.plan_id else None,
            "plan_name": contract.plan_name,
            "commitment_kwh": str(contract.commitment_kwh),
            "rate_toman_per_kwh": str(contract.rate_toman_per_kwh),
        },
    }


@transaction.atomic
def sign_contract(
    *,
    contract: Contract,
    signer: User,
    signature_file_uuid: UUID,
    terms_version: str,
    terms_sha256: str,
) -> Contract:
    contract = _lock_contract_and_site(contract_id=contract.pk, owner_id=signer.pk)
    if contract.status != ContractStatus.DRAFT:
        raise ValidationError({"detail": "Only a draft contract can be signed."})
    if contract.plant_id is None or contract.plan_id is None:
        raise ValidationError({"detail": "Select an approved plant and an active plan first."})
    if contract.plant.status != PlantStatus.ACTIVE:
        raise ValidationError({"plant": "The plant must still be approved before signing."})
    if contract.plant.branch.status != BranchStatus.ACTIVE:
        raise ValidationError({"branch": "The branch must still be approved before signing."})

    identity = _identity_snapshot(contract.owner)
    if identity is None:
        raise ValidationError(
            {"identity_profile": "Complete the required identity information before signing."}
        )
    signature_file = (
        StoredFile.objects.select_for_update()
        .filter(
            uuid=signature_file_uuid,
            owner=signer,
            purpose=FilePurpose.CONTRACT,
            visibility=FileVisibility.PRIVATE,
        )
        .first()
    )
    if signature_file is None:
        raise NotFound("Private contract signature file not found.")
    if signature_file.content_type not in {"image/png", "image/jpeg", "image/webp"}:
        raise ValidationError(
            {"signature_file_uuid": "Signature evidence must be a PNG, JPEG, or WebP image."}
        )
    if Contract.all_objects.filter(signature_file=signature_file).exists():
        raise ValidationError({"signature_file_uuid": "This signature file is already in use."})

    signed_at = timezone.now()
    previous_status = contract.status
    contract.status = ContractStatus.PENDING
    contract.terms_version = terms_version
    contract.terms_sha256 = terms_sha256.lower()
    contract.signed_at = signed_at
    contract.signature_file = signature_file
    contract.review_decision = ""
    contract.reviewed_at = None
    contract.reviewed_by_uuid = None
    contract.review_note = ""
    contract.save(
        update_fields=[
            "status",
            "terms_version",
            "terms_sha256",
            "signed_at",
            "signature_file",
            "review_decision",
            "reviewed_at",
            "reviewed_by_uuid",
            "review_note",
            "updated_at",
        ]
    )
    ContractHistory.objects.create(
        contract=contract,
        event_type=ContractHistory.EventType.SIGNED,
        from_status=previous_status,
        to_status=contract.status,
        actor_uuid=signer.uuid,
        details={
            "accepted_terms_version": terms_version,
            "accepted_terms_sha256": contract.terms_sha256,
            "signature_file_uuid": str(signature_file.uuid),
            "signed_at": signed_at.isoformat(),
            "contract_snapshot": _signed_contract_snapshot(contract, identity),
        },
    )
    return contract


@transaction.atomic
def review_contract(
    *, contract: Contract, reviewer: User, decision: str, reason: str = ""
) -> Contract:
    if decision not in {"approved", "rejected"}:
        raise ValidationError({"decision": "Select approved or rejected."})
    contract = _lock_contract_and_site(contract_id=contract.pk)
    if contract.status != ContractStatus.PENDING or contract.review_decision:
        raise ValidationError({"detail": "Only a signed contract awaiting review can be decided."})
    if contract.plant_id is None or contract.plan_id is None:
        raise ValidationError({"detail": "The contract is missing its plant or plan terms."})
    if contract.signed_at is None or contract.signature_file_id is None:
        raise ValidationError({"detail": "The contract has no recorded seller signature."})
    if decision == "approved":
        if contract.plant.status != PlantStatus.ACTIVE:
            raise ValidationError(
                {"plant": "The plant must remain approved to activate this contract."}
            )
        if contract.plant.branch.status != BranchStatus.ACTIVE:
            raise ValidationError(
                {"branch": "The branch must remain approved to activate this contract."}
            )
        contract.status = ContractStatus.ACTIVE
        event_type = ContractHistory.EventType.APPROVED
        contract.review_note = ""
    else:
        # Rejection closes this signed version. The seller can correct data and start a new draft.
        contract.status = ContractStatus.CANCELLED
        event_type = ContractHistory.EventType.REJECTED
        contract.review_note = reason

    reviewed_at = timezone.now()
    previous_status = ContractStatus.PENDING
    contract.review_decision = decision
    contract.reviewed_at = reviewed_at
    contract.reviewed_by_uuid = reviewer.uuid
    contract.save(
        update_fields=[
            "status",
            "review_decision",
            "reviewed_at",
            "reviewed_by_uuid",
            "review_note",
            "updated_at",
        ]
    )
    ContractHistory.objects.create(
        contract=contract,
        event_type=event_type,
        from_status=previous_status,
        to_status=contract.status,
        actor_uuid=reviewer.uuid,
        details={"decision": decision, "reason": reason, "reviewed_at": reviewed_at.isoformat()},
    )
    return contract
