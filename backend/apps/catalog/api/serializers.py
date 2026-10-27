from __future__ import annotations

from decimal import Decimal

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.catalog.models import Equipment, EquipmentPriceMode, SellPlan
from apps.catalog.validators import validate_plan_benefits


class EquipmentSerializer(serializers.ModelSerializer):
    units_per_kwp = serializers.DecimalField(
        max_digits=9, decimal_places=3, coerce_to_string=False, read_only=True
    )

    class Meta:
        model = Equipment
        fields = (
            "uuid",
            "name",
            "category",
            "brand",
            "power_watts",
            "price_toman",
            "price_mode",
            "units_per_kwp",
            "is_active",
            "show_in_price_list",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class EquipmentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = (
            "name",
            "category",
            "brand",
            "power_watts",
            "price_toman",
            "price_mode",
            "units_per_kwp",
            "is_active",
            "show_in_price_list",
        )

    def validate(self, attrs: dict) -> dict:
        price_mode = attrs.get("price_mode", getattr(self.instance, "price_mode", None))
        units_per_kwp = attrs.get("units_per_kwp", getattr(self.instance, "units_per_kwp", None))
        if price_mode == EquipmentPriceMode.PER_UNIT and (
            units_per_kwp is None or units_per_kwp <= 0
        ):
            raise serializers.ValidationError(
                {"units_per_kwp": "A positive value is required for per_unit pricing."}
            )
        if price_mode != EquipmentPriceMode.PER_UNIT and units_per_kwp is not None:
            raise serializers.ValidationError(
                {"units_per_kwp": "Only per_unit pricing accepts units_per_kwp."}
            )
        return attrs


class EstimateQuerySerializer(serializers.Serializer):
    capacity_kwp = serializers.DecimalField(
        max_digits=8,
        decimal_places=3,
        min_value=Decimal("0.001"),
        coerce_to_string=False,
    )


class EstimateLineSerializer(serializers.Serializer):
    equipment_uuid = serializers.UUIDField()
    name = serializers.CharField()
    category = serializers.CharField()
    price_mode = serializers.CharField()
    unit_price_toman = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=18, decimal_places=3, coerce_to_string=False)
    total_toman = serializers.IntegerField()


class EstimateSerializer(serializers.Serializer):
    capacity_kwp = serializers.DecimalField(max_digits=8, decimal_places=3, coerce_to_string=False)
    items = EstimateLineSerializer(many=True)
    total_toman = serializers.IntegerField()


class SellPlanSerializer(serializers.ModelSerializer):
    commitment_kwh = serializers.DecimalField(
        max_digits=14, decimal_places=3, coerce_to_string=False, read_only=True
    )
    rate_toman_per_kwh = serializers.DecimalField(
        max_digits=14, decimal_places=3, coerce_to_string=False, read_only=True
    )

    class Meta:
        model = SellPlan
        fields = (
            "uuid",
            "name",
            "description",
            "commitment_kwh",
            "rate_toman_per_kwh",
            "savings_text",
            "benefits",
            "is_recommended",
            "is_active",
            "sort_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class SellPlanWriteSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        max_length=150, validators=[UniqueValidator(queryset=SellPlan.all_objects.all())]
    )
    benefits = serializers.JSONField(required=False, validators=[validate_plan_benefits])

    class Meta:
        model = SellPlan
        fields = (
            "name",
            "description",
            "commitment_kwh",
            "rate_toman_per_kwh",
            "savings_text",
            "benefits",
            "is_recommended",
            "is_active",
            "sort_order",
        )
