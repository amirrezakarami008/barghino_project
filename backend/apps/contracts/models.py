"""Minimal contract storage for selecting and retaining sell-plan terms."""

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel, TimeStampedModel, UUIDModel


class ContractStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING = "pending", "Pending"
    ACTIVE = "active", "Active"
    EXPIRED = "expired", "Expired"
    CANCELLED = "cancelled", "Cancelled"


class Contract(BaseModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="contracts"
    )
    plant = models.ForeignKey(
        "plants.Plant",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="contracts",
        db_index=False,
    )
    # Retain provenance. Soft-deleting a plan is allowed; hard deletion is protected.
    plan = models.ForeignKey(
        "catalog.SellPlan",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="contracts",
    )
    plan_name = models.CharField(max_length=150, blank=True, default="")
    commitment_kwh = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        null=True,
        blank=True,
        help_text="Selected plan's committed energy snapshot in kWh.",
    )
    rate_toman_per_kwh = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        null=True,
        blank=True,
        help_text="Selected plan's rate snapshot in toman per kWh.",
    )
    status = models.CharField(
        max_length=16, choices=ContractStatus.choices, default=ContractStatus.DRAFT
    )
    terms_version = models.CharField(max_length=64, blank=True, default="", db_default="")
    terms_sha256 = models.CharField(max_length=64, blank=True, default="", db_default="")
    signed_at = models.DateTimeField(null=True, blank=True)
    signature_file = models.ForeignKey(
        "files.StoredFile",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="signed_contracts",
        db_constraint=False,
        db_index=False,
    )
    review_decision = models.CharField(max_length=16, blank=True, default="", db_default="")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by_uuid = models.UUIDField(null=True, blank=True)
    review_note = models.CharField(max_length=1000, blank=True, default="", db_default="")

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=ContractStatus.values),
                name="contracts_contract_status_valid",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(
                        plan__isnull=True,
                        plan_name="",
                        commitment_kwh__isnull=True,
                        rate_toman_per_kwh__isnull=True,
                    )
                    | (
                        models.Q(
                            plan__isnull=False,
                            commitment_kwh__isnull=False,
                            rate_toman_per_kwh__isnull=False,
                            commitment_kwh__gt=0,
                            rate_toman_per_kwh__gt=0,
                        )
                        & ~models.Q(plan_name="")
                    )
                ),
                name="contracts_contract_plan_terms_complete",
            ),
        ]


class ContractHistory(UUIDModel, TimeStampedModel):
    """Append-only lifecycle evidence for signing and company decisions."""

    class EventType(models.TextChoices):
        SIGNED = "signed", "Signed by seller"
        APPROVED = "approved", "Approved by company"
        REJECTED = "rejected", "Rejected by company"

    contract = models.ForeignKey(
        Contract, on_delete=models.CASCADE, related_name="history", db_index=False
    )
    event_type = models.CharField(max_length=16, choices=EventType.choices)
    from_status = models.CharField(max_length=16)
    to_status = models.CharField(max_length=16)
    actor_uuid = models.UUIDField(null=True, blank=True)
    details = models.JSONField(default=dict)

    class Meta:
        ordering = ["created_at", "id"]
