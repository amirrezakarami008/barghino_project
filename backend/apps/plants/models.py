"""Household branches (utility meters) and solar plants."""

from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class BranchStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    PENDING = "pending", "Pending"
    INACTIVE = "inactive", "Inactive"


class PlantStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    PENDING = "pending", "Pending"
    MAINTENANCE = "maintenance", "Maintenance"
    INACTIVE = "inactive", "Inactive"


class Branch(BaseModel):
    """Household utility connection (branch) owned by a customer.

    ``meter_number`` is unique among non-deleted rows so the same meter cannot
    be registered twice for sale.
    """

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="branches",
    )
    name = models.CharField(max_length=150)
    meter_number = models.CharField(max_length=64)
    address = models.CharField(max_length=500)
    status = models.CharField(
        max_length=16,
        choices=BranchStatus.choices,
        default=BranchStatus.PENDING,
        db_index=True,
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_branches",
        db_index=False,
    )
    review_decision = models.CharField(max_length=16, blank=True, default="", db_default="")
    review_note = models.CharField(max_length=1000, blank=True, default="", db_default="")

    class Meta:
        verbose_name = "branch"
        verbose_name_plural = "branches"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "-created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=BranchStatus.values),
                name="plants_branch_status_valid",
            ),
            models.UniqueConstraint(
                fields=["meter_number"],
                condition=models.Q(deleted_at__isnull=True),
                name="plants_branch_meter_number_alive_uniq",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.meter_number})"


class Plant(BaseModel):
    """Solar plant attached to a household branch.

    Ownership is denormalized on ``owner`` for permission checks; the branch
    must belong to the same user.
    """

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="plants",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.PROTECT,
        related_name="plants",
    )
    name = models.CharField(max_length=150)
    address = models.CharField(max_length=500)
    capacity_kwp = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        help_text="Installed capacity in kilowatt-peak.",
    )
    commissioned_at = models.DateField(
        null=True,
        blank=True,
        help_text="Commissioning / go-live date. Empty while pending.",
    )
    status = models.CharField(
        max_length=16,
        choices=PlantStatus.choices,
        default=PlantStatus.PENDING,
        db_index=True,
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_plants",
        db_index=False,
    )
    review_decision = models.CharField(max_length=16, blank=True, default="", db_default="")
    review_note = models.CharField(max_length=1000, blank=True, default="", db_default="")

    class Meta:
        verbose_name = "plant"
        verbose_name_plural = "plants"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "-created_at"]),
            models.Index(fields=["branch", "-created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=PlantStatus.values),
                name="plants_plant_status_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(capacity_kwp__gt=0),
                name="plants_plant_capacity_positive",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.capacity_kwp} kWp)"
