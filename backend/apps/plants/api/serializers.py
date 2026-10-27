from __future__ import annotations

from rest_framework import serializers

from apps.plants.models import Branch, Plant


class BranchSerializer(serializers.ModelSerializer):
    owner_uuid = serializers.UUIDField(source="owner.uuid", read_only=True)
    owner_phone = serializers.CharField(source="owner.phone", read_only=True)
    reviewed_by_uuid = serializers.UUIDField(
        source="reviewed_by.uuid", read_only=True, allow_null=True
    )

    class Meta:
        model = Branch
        fields = (
            "uuid",
            "owner_uuid",
            "owner_phone",
            "name",
            "meter_number",
            "address",
            "status",
            "reviewed_at",
            "reviewed_by_uuid",
            "review_decision",
            "review_note",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "uuid",
            "status",
            "reviewed_at",
            "reviewed_by_uuid",
            "review_decision",
            "review_note",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "name": {"help_text": "Label for this household branch."},
            "meter_number": {"help_text": "Utility meter number; unique across the platform."},
            "address": {"help_text": "Branch / meter address."},
            "status": {"help_text": "Set by staff review; users cannot set this field."},
        }


class BranchWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    meter_number = serializers.CharField(max_length=64)
    address = serializers.CharField(max_length=500)


class BranchUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=False)
    meter_number = serializers.CharField(max_length=64, required=False)
    address = serializers.CharField(max_length=500, required=False)

    def validate(self, attrs: dict) -> dict:
        if not attrs:
            raise serializers.ValidationError("Provide at least one field to update.")
        return attrs


class PlantSerializer(serializers.ModelSerializer):
    owner_uuid = serializers.UUIDField(source="owner.uuid", read_only=True)
    owner_phone = serializers.CharField(source="owner.phone", read_only=True)
    branch_uuid = serializers.UUIDField(source="branch.uuid", read_only=True)
    reviewed_by_uuid = serializers.UUIDField(
        source="reviewed_by.uuid", read_only=True, allow_null=True
    )
    capacity_kwp = serializers.DecimalField(
        max_digits=8,
        decimal_places=3,
        coerce_to_string=False,
    )

    class Meta:
        model = Plant
        fields = (
            "uuid",
            "owner_uuid",
            "owner_phone",
            "branch_uuid",
            "name",
            "address",
            "capacity_kwp",
            "commissioned_at",
            "status",
            "reviewed_at",
            "reviewed_by_uuid",
            "review_decision",
            "review_note",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
        extra_kwargs = {
            "name": {"help_text": "Plant display name."},
            "address": {"help_text": "Installation address."},
            "capacity_kwp": {"help_text": "Capacity in kWp (number)."},
            "commissioned_at": {"help_text": "Go-live date; null while pending."},
            "status": {"help_text": "Set by staff review; users cannot set this field."},
        }


class PlantWriteSerializer(serializers.Serializer):
    branch_uuid = serializers.UUIDField(
        help_text="UUID of an owned branch to attach this plant to.",
    )
    name = serializers.CharField(max_length=150)
    address = serializers.CharField(max_length=500)
    capacity_kwp = serializers.DecimalField(
        max_digits=8,
        decimal_places=3,
        min_value=0,
        coerce_to_string=False,
        help_text="Installed capacity in kWp; must be > 0.",
    )
    commissioned_at = serializers.DateField(required=False, allow_null=True)


class PlantUpdateSerializer(serializers.Serializer):
    branch_uuid = serializers.UUIDField(required=False)
    name = serializers.CharField(max_length=150, required=False)
    address = serializers.CharField(max_length=500, required=False)
    capacity_kwp = serializers.DecimalField(
        max_digits=8,
        decimal_places=3,
        min_value=0,
        required=False,
        coerce_to_string=False,
    )
    commissioned_at = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs: dict) -> dict:
        if not attrs:
            raise serializers.ValidationError("Provide at least one field to update.")
        return attrs


class ReviewDecisionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=("approved", "rejected"))
    reason = serializers.CharField(max_length=1000, required=False, allow_blank=True)

    def validate(self, attrs: dict) -> dict:
        if attrs["decision"] == "rejected" and not attrs.get("reason", "").strip():
            raise serializers.ValidationError({"reason": "A reason is required when rejecting."})
        attrs["reason"] = attrs.get("reason", "").strip()
        return attrs
