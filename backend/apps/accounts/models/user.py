from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone

from apps.accounts.managers import UserManager
from apps.accounts.validators import normalize_iran_mobile, validate_iran_mobile
from apps.core.models import UUIDModel


class AccountType(models.TextChoices):
    INDIVIDUAL = "individual", "Individual"
    LEGAL = "legal", "Legal"


class UserPath(models.TextChoices):
    SELL = "sell", "Sell"
    INSTALL = "install", "Install"


class User(AbstractUser, UUIDModel):
    """Login identity for Bargino.

    ``phone`` is the login identifier. ``account_type`` is the customer kind
    (individual or legal) and stays empty for staff accounts that are not
    customers. Product role is ``is_staff``: ``user`` or ``admin``.
    ``username`` is kept equal to ``phone`` so Django's unique username column
    stays in sync.
    """

    phone = models.CharField(
        max_length=11,
        unique=True,
        validators=[validate_iran_mobile],
        help_text="Iranian mobile number, stored as 09xxxxxxxxx.",
    )
    account_type = models.CharField(
        max_length=16,
        choices=AccountType.choices,
        blank=True,
        default="",
        help_text="Empty for staff accounts that are not customers.",
    )
    path = models.CharField(
        max_length=16,
        choices=UserPath.choices,
        blank=True,
        default="",
        help_text="Product path chosen at registration. Empty until the user picks one.",
    )
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    token_version = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(account_type__in=[*AccountType.values, ""]),
                name="accounts_user_account_type_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(path__in=[*UserPath.values, ""]),
                name="accounts_user_path_valid",
            ),
            models.UniqueConstraint(
                Lower("email"),
                condition=~models.Q(email=""),
                name="accounts_user_email_ci_unique",
            ),
        ]

    def __str__(self) -> str:
        return self.phone

    def save(self, *args, **kwargs):
        update_fields = kwargs.get("update_fields")
        touches_identity = update_fields is None or bool({"phone", "username"} & set(update_fields))
        if touches_identity:
            if not self.phone:
                raise ValidationError({"phone": "A phone number is required."})
            self.phone = normalize_iran_mobile(self.phone)
            validate_iran_mobile(self.phone)
            self.username = self.phone
            if update_fields is not None:
                kwargs["update_fields"] = set(update_fields) | {"phone", "username"}
        super().save(*args, **kwargs)

    @property
    def role(self) -> str:
        return "admin" if self.is_staff else "user"

    @property
    def is_phone_verified(self) -> bool:
        return self.phone_verified_at is not None

    def mark_phone_verified(self) -> None:
        self.phone_verified_at = timezone.now()
        self.save(update_fields=["phone_verified_at"])

    def bump_token_version(self) -> int:
        """Invalidate all outstanding JWTs that carry an older ``tv`` claim."""
        self.token_version = models.F("token_version") + 1
        self.save(update_fields=["token_version"])
        self.refresh_from_db(fields=["token_version"])
        return self.token_version
