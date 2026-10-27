from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import BaseUserCreationForm, UserChangeForm

from apps.accounts.models import IndividualProfile, LegalProfile, User
from apps.accounts.validators import normalize_iran_mobile, validate_iran_mobile


class PhoneUserCreationForm(BaseUserCreationForm):
    """Admin form for creating a user with a mobile number instead of a username."""

    class Meta(BaseUserCreationForm.Meta):
        model = User
        fields = ("phone", "account_type", "path")

    def clean_phone(self) -> str:
        phone = normalize_iran_mobile(self.cleaned_data.get("phone", ""))
        validate_iran_mobile(phone)
        if User.objects.filter(phone=phone).exists():
            raise forms.ValidationError("A user with this phone already exists.")
        return phone


class PhoneUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User


class IndividualProfileInline(admin.StackedInline):
    model = IndividualProfile
    extra = 0
    max_num = 1
    readonly_fields = ("uuid", "created_at", "updated_at")


class LegalProfileInline(admin.StackedInline):
    model = LegalProfile
    extra = 0
    max_num = 1
    readonly_fields = ("uuid", "created_at", "updated_at")


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    form = PhoneUserChangeForm
    add_form = PhoneUserCreationForm
    inlines = (IndividualProfileInline, LegalProfileInline)
    ordering = ("phone",)
    list_display = ("phone", "account_type", "path", "role", "is_active", "is_phone_verified")
    list_filter = ("account_type", "path", "is_staff", "is_active")
    search_fields = (
        "phone",
        "email",
        "first_name",
        "last_name",
        "individual_profile__national_id",
        "individual_profile__last_name",
        "legal_profile__company_name",
        "legal_profile__company_national_id",
    )
    readonly_fields = (
        "uuid",
        "username",
        "role",
        "phone_verified_at",
        "terms_accepted_at",
        "token_version",
    )
    fieldsets = (
        (None, {"fields": ("phone", "username", "password")}),
        (
            "Profile",
            {"fields": ("account_type", "path", "first_name", "last_name", "email")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Security",
            {
                "fields": (
                    "uuid",
                    "role",
                    "phone_verified_at",
                    "terms_accepted_at",
                    "token_version",
                    "last_login",
                    "date_joined",
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("phone", "account_type", "path", "password1", "password2"),
            },
        ),
    )

    @admin.display(description="Role")
    def role(self, obj: User) -> str:
        return obj.role

    @admin.display(boolean=True, description="Phone verified")
    def is_phone_verified(self, obj: User) -> bool:
        return obj.is_phone_verified
