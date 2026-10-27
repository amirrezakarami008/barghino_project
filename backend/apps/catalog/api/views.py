from __future__ import annotations

from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import generics, permissions, status
from rest_framework.permissions import SAFE_METHODS
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.api.serializers import (
    EquipmentSerializer,
    EquipmentWriteSerializer,
    EstimateQuerySerializer,
    EstimateSerializer,
)
from apps.catalog.models import Equipment
from apps.catalog.selectors import equipment_for_request
from apps.catalog.services.equipment import (
    create_equipment,
    soft_delete_equipment,
    update_equipment,
)
from apps.catalog.services.estimate import estimate_equipment_cost
from apps.core.openapi import TAG_EQUIPMENT
from apps.core.permissions import IsStaff


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_EQUIPMENT],
        auth=[],
        summary="List equipment",
        description=(
            "Public callers see active equipment. Staff see active and inactive equipment. "
            "Filter by category, price mode, active flag or price-list flag; search name/brand. "
            "Default order is oldest first, which also determines the selected panel/inverter."
        ),
        responses={200: EquipmentSerializer(many=True)},
    ),
    post=extend_schema(
        tags=[TAG_EQUIPMENT],
        summary="Create equipment (staff)",
        request=EquipmentWriteSerializer,
        responses={201: EquipmentSerializer},
    ),
)
class EquipmentListCreateView(generics.ListCreateAPIView):
    serializer_class = EquipmentSerializer
    filterset_fields = ("category", "price_mode", "is_active", "show_in_price_list")
    search_fields = ("name", "brand")
    ordering_fields = ("created_at", "name", "price_toman", "category")

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsStaff()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Equipment.objects.none()
        user = self.request.user
        is_staff = bool(user and user.is_authenticated and user.is_staff)
        return equipment_for_request(is_staff=is_staff)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = EquipmentWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = create_equipment(data=serializer.validated_data)
        return Response(EquipmentSerializer(item).data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_EQUIPMENT],
        auth=[],
        summary="Get equipment",
        description="Public callers can read active items; staff can also read inactive items.",
        responses={200: EquipmentSerializer},
    ),
    put=extend_schema(
        tags=[TAG_EQUIPMENT],
        summary="Replace equipment (staff)",
        request=EquipmentWriteSerializer,
        responses={200: EquipmentSerializer},
    ),
    patch=extend_schema(
        tags=[TAG_EQUIPMENT],
        summary="Update equipment or active state (staff)",
        request=EquipmentWriteSerializer,
        responses={200: EquipmentSerializer},
    ),
    delete=extend_schema(
        tags=[TAG_EQUIPMENT],
        summary="Soft-delete equipment (staff)",
        responses={204: OpenApiResponse(description="Deleted")},
    ),
)
class EquipmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EquipmentSerializer
    lookup_field = "uuid"

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsStaff()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Equipment.objects.none()
        user = self.request.user
        is_staff = bool(user and user.is_authenticated and user.is_staff)
        return equipment_for_request(is_staff=is_staff)

    def update(self, request: Request, *args, **kwargs) -> Response:
        item = self.get_object()
        serializer = EquipmentWriteSerializer(
            item, data=request.data, partial=kwargs.pop("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        item = update_equipment(item=item, data=serializer.validated_data)
        return Response(EquipmentSerializer(item).data)

    def perform_destroy(self, instance: Equipment) -> None:
        soft_delete_equipment(item=instance)


class EquipmentEstimateView(APIView):
    permission_classes = (permissions.AllowAny,)

    @extend_schema(
        tags=[TAG_EQUIPMENT],
        auth=[],
        summary="Estimate installation equipment cost",
        description=(
            "Accept capacity in kWp. Include the first active panel and inverter by "
            "creation order, plus every active item in other categories. "
            "per_kwp uses capacity, per_unit rounds quantity up, and fixed counts once. "
            "Each line is rounded up to whole toman. Empty catalog returns zero and no lines."
        ),
        parameters=[
            OpenApiParameter(
                name="capacity_kwp",
                type=float,
                location=OpenApiParameter.QUERY,
                required=True,
                description="Positive capacity in kWp, up to three decimal places.",
            )
        ],
        responses={200: EstimateSerializer},
    )
    def get(self, request: Request) -> Response:
        serializer = EstimateQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        result = estimate_equipment_cost(capacity_kwp=serializer.validated_data["capacity_kwp"])
        return Response(EstimateSerializer(result).data)
