from django.db import models

from apps.accounts.models.user import User
from apps.accounts.validators import (
    digits_only,
    validate_company_national_id,
    validate_national_id,
)
from apps.core.models import TimeStampedModel, UUIDModel


class IndividualProfile(UUIDModel, TimeStampedModel):
    """Identity of a natural-person customer. One profile per user."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="individual_profile",
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    national_id = models.CharField(
        max_length=10,
        unique=True,
        validators=[validate_national_id],
    )

    class Meta:
        verbose_name = "individual profile"
        verbose_name_plural = "individual profiles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        self.national_id = digits_only(self.national_id)
        self.full_clean()
        return super().save(*args, **kwargs)


class LegalProfile(UUIDModel, TimeStampedModel):
    """Identity of a legal-entity customer. Login stays on the representative's phone."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="legal_profile",
    )
    company_name = models.CharField(max_length=255)
    company_national_id = models.CharField(
        max_length=11,
        unique=True,
        validators=[validate_company_national_id],
    )
    representative_first_name = models.CharField(max_length=150)
    representative_last_name = models.CharField(max_length=150)
    representative_national_id = models.CharField(
        max_length=10,
        db_index=True,
        validators=[validate_national_id],
        help_text="Not unique: one person may represent more than one company.",
    )
    registration_number = models.CharField(max_length=20, blank=True, default="")
    economic_code = models.CharField(max_length=14, blank=True, default="")

    class Meta:
        verbose_name = "legal profile"
        verbose_name_plural = "legal profiles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.company_name

    def save(self, *args, **kwargs):
        self.company_national_id = digits_only(self.company_national_id)
        self.representative_national_id = digits_only(self.representative_national_id)
        self.full_clean()
        return super().save(*args, **kwargs)
