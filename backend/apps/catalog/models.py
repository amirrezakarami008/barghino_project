"""Installation equipment and electricity sell plans."""

from __future__ import annotations

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from apps.catalog.validators import validate_plan_benefits
from apps.core.models import BaseModel


class EquipmentCategory(models.TextChoices):
    PANEL = "panel", "Panel"
    INVERTER = "inverter", "Inverter"
    MOUNTING = "mounting", "Mounting"
    CABLING = "cabling", "Cabling"
    PROTECTION = "protection", "Protection"
    BATTERY = "battery", "Battery"
    OTHER = "other", "Other"


class EquipmentPriceMode(models.TextChoices):
    PER_KWP = "per_kwp", "Per kWp"
    PER_UNIT = "per_unit", "Per unit"
    FIXED = "fixed", "Fixed"


class Equipment(BaseModel):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=16, choices=EquipmentCategory.choices, db_index=True)
    brand = models.CharField(max_length=150, blank=True, default="")
    power_watts = models.PositiveIntegerField(null=True, blank=True)
    price_toman = models.PositiveBigIntegerField()
    price_mode = models.CharField(max_length=16, choices=EquipmentPriceMode.choices)
    units_per_kwp = models.DecimalField(max_digits=9, decimal_places=3, null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    show_in_price_list = models.BooleanField(default=True)

    class Meta:
        ordering = ["created_at", "pk"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(category__in=EquipmentCategory.values),
                name="catalog_equipment_category_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(price_mode__in=EquipmentPriceMode.values),
                name="catalog_equipment_price_mode_valid",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(price_mode=EquipmentPriceMode.PER_UNIT, units_per_kwp__gt=0)
                    | models.Q(
                        ~models.Q(price_mode=EquipmentPriceMode.PER_UNIT),
                        units_per_kwp__isnull=True,
                    )
                ),
                name="catalog_equipment_units_match_mode",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.category})"


class SellPlan(BaseModel):
    name = models.CharField(max_length=150, unique=True)
    description = models.CharField(max_length=500, blank=True, default="")
    commitment_kwh = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))],
        help_text="Committed energy in kWh.",
    )
    rate_toman_per_kwh = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))],
        help_text="Rate in toman (IRT) per kWh.",
    )
    savings_text = models.TextField(blank=True, default="")
    benefits = models.JSONField(default=list, blank=True)
    is_recommended = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "created_at", "pk"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(commitment_kwh__gt=0),
                name="catalog_sellplan_commitment_positive",
            ),
            models.CheckConstraint(
                condition=models.Q(rate_toman_per_kwh__gt=0),
                name="catalog_sellplan_rate_positive",
            ),
        ]

    def clean(self) -> None:
        super().clean()
        try:
            validate_plan_benefits(self.benefits)
        except ValidationError as exc:
            raise ValidationError({"benefits": exc.messages}) from exc

    def __str__(self) -> str:
        return self.name
