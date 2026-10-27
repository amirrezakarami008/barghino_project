from __future__ import annotations

from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, permissions, status
from rest_framework.permissions import SAFE_METHODS
from rest_framework.request import Request
from rest_framework.response import Response

from apps.catalog.api.serializers import SellPlanSerializer, SellPlanWriteSerializer
from apps.catalog.models import SellPlan
from apps.catalog.selectors import plans_for_request
from apps.catalog.services.plans import create_plan, soft_delete_plan, update_plan
from apps.core.openapi import TAG_PLANS
from apps.core.permissions import IsStaff


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_PLANS],
        auth=[],
        summary="List electricity sell plans",
        description=(
            "Public callers see active plans only; staff also see inactive plans. "
            "Filter by is_active/is_recommended. Default order: sort_order, created_at, id. "
            "Commitments are numeric kWh and rates are numeric toman per kWh."
        ),
        responses={200: SellPlanSerializer(many=True)},
    ),
    post=extend_schema(
        tags=[TAG_PLANS],
        summary="Create a sell plan (staff)",
        request=SellPlanWriteSerializer,
        responses={201: SellPlanSerializer},
    ),
)
class SellPlanListCreateView(generics.ListCreateAPIView):
    serializer_class = SellPlanSerializer
    filterset_fields = ("is_active", "is_recommended")
    ordering_fields = ("sort_order", "created_at", "name")

    def get_permissions(self):
        return [permissions.AllowAny()] if self.request.method in SAFE_METHODS else [IsStaff()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return plans_for_request(is_staff=False).none()
        user = self.request.user
        is_staff = bool(user and user.is_authenticated and user.is_staff)
        return plans_for_request(is_staff=is_staff)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = SellPlanWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = create_plan(data=serializer.validated_data)
        return Response(SellPlanSerializer(plan).data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_PLANS],
        auth=[],
        summary="Get a sell plan",
        description="Public callers see active plans only; staff can also retrieve inactive plans.",
        responses={200: SellPlanSerializer},
    ),
    put=extend_schema(
        tags=[TAG_PLANS],
        summary="Replace a sell plan (staff)",
        request=SellPlanWriteSerializer,
        responses={200: SellPlanSerializer},
    ),
    patch=extend_schema(
        tags=[TAG_PLANS],
        summary="Update a sell plan or active state (staff)",
        request=SellPlanWriteSerializer,
        responses={200: SellPlanSerializer},
    ),
    delete=extend_schema(
        tags=[TAG_PLANS],
        summary="Soft-delete a sell plan (staff)",
        responses={204: OpenApiResponse(description="Deleted")},
    ),
)
class SellPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SellPlanSerializer
    lookup_field = "uuid"

    def get_permissions(self):
        return [permissions.AllowAny()] if self.request.method in SAFE_METHODS else [IsStaff()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return plans_for_request(is_staff=False).none()
        user = self.request.user
        is_staff = bool(user and user.is_authenticated and user.is_staff)
        return plans_for_request(is_staff=is_staff)

    def update(self, request: Request, *args, **kwargs) -> Response:
        plan = self.get_object()
        serializer = SellPlanWriteSerializer(
            plan, data=request.data, partial=kwargs.pop("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        plan = update_plan(plan=plan, data=serializer.validated_data)
        return Response(SellPlanSerializer(plan).data)

    def perform_destroy(self, instance: SellPlan) -> None:
        soft_delete_plan(plan=instance)
