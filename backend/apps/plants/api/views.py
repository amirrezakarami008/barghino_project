from __future__ import annotations

from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.openapi import TAG_BRANCHES, TAG_PLANTS
from apps.core.permissions import IsOwner, IsStaff
from apps.plants.api.serializers import (
    BranchSerializer,
    BranchUpdateSerializer,
    BranchWriteSerializer,
    PlantSerializer,
    PlantUpdateSerializer,
    PlantWriteSerializer,
    ReviewDecisionSerializer,
)
from apps.plants.models import Branch, BranchStatus, Plant, PlantStatus
from apps.plants.selectors import branches_for_user, plants_for_user
from apps.plants.services.branches import create_branch, soft_delete_branch, update_branch
from apps.plants.services.plants import create_plant, soft_delete_plant, update_plant
from apps.plants.services.reviews import review_branch, review_plant


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_BRANCHES],
        summary="List my branches",
        description=(
            "Paginated list of household utility branches (meters) owned by the "
            "authenticated user. Soft-deleted rows are excluded."
        ),
        responses={200: BranchSerializer(many=True)},
    ),
    post=extend_schema(
        tags=[TAG_BRANCHES],
        summary="Register a branch",
        description=(
            "Create a household branch. `meter_number` must be unique among active "
            "(non-deleted) branches system-wide. New branches always start as `pending`; "
            "only staff may approve or reject them."
        ),
        request=BranchWriteSerializer,
        responses={201: BranchSerializer},
    ),
)
class BranchListCreateView(generics.ListCreateAPIView):
    serializer_class = BranchSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Branch.objects.none()
        return branches_for_user(self.request.user)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = BranchWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        branch = create_branch(owner=request.user, data=serializer.validated_data)
        return Response(
            BranchSerializer(branch).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_BRANCHES],
        summary="Get a branch",
        description="Return one owned branch by public UUID.",
        responses={200: BranchSerializer},
    ),
    put=extend_schema(
        tags=[TAG_BRANCHES],
        summary="Replace branch fields",
        description=(
            "Full update of name, meter number, and address. Any changed data returns the branch "
            "to pending review."
        ),
        request=BranchWriteSerializer,
        responses={200: BranchSerializer},
    ),
    patch=extend_schema(
        tags=[TAG_BRANCHES],
        summary="Update a branch",
        description="Partial update. Changing `meter_number` still enforces global uniqueness.",
        request=BranchUpdateSerializer,
        responses={200: BranchSerializer},
    ),
    delete=extend_schema(
        tags=[TAG_BRANCHES],
        summary="Soft-delete a branch",
        description=(
            "Soft-deletes the branch. Fails with validation error if any non-deleted "
            "plants are still attached."
        ),
        responses={204: OpenApiResponse(description="Deleted")},
    ),
)
class BranchDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BranchSerializer
    owner_field = "owner"
    lookup_field = "uuid"

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated

        return [IsAuthenticated(), IsOwner()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Branch.objects.none()
        return branches_for_user(self.request.user)

    def update(self, request: Request, *args, **kwargs) -> Response:
        partial = kwargs.pop("partial", False)
        branch = self.get_object()
        serializer_class = BranchUpdateSerializer if partial else BranchWriteSerializer
        serializer = serializer_class(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        branch = update_branch(branch=branch, data=serializer.validated_data)
        return Response(BranchSerializer(branch).data)

    def perform_destroy(self, instance: Branch) -> None:
        soft_delete_branch(branch=instance)


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_PLANTS],
        summary="List my plants",
        description=(
            "Paginated list of solar plants owned by the authenticated user, "
            "including `branch_uuid`. Soft-deleted rows are excluded."
        ),
        responses={200: PlantSerializer(many=True)},
    ),
    post=extend_schema(
        tags=[TAG_PLANTS],
        summary="Register a plant",
        description=(
            "Create a plant attached to an owned branch (`branch_uuid`). "
            "Used on the sell path to introduce an existing rooftop system. "
            "`capacity_kwp` is a number (kWp). New plants always start as `pending`; "
            "only staff may approve or reject them."
        ),
        request=PlantWriteSerializer,
        responses={201: PlantSerializer},
    ),
)
class PlantListCreateView(generics.ListCreateAPIView):
    serializer_class = PlantSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Plant.objects.none()
        return plants_for_user(self.request.user)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = PlantWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plant = create_plant(owner=request.user, data=serializer.validated_data)
        return Response(
            PlantSerializer(plant).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_PLANTS],
        summary="Get a plant",
        description="Return one owned plant by public UUID.",
        responses={200: PlantSerializer},
    ),
    put=extend_schema(
        tags=[TAG_PLANTS],
        summary="Replace plant fields",
        request=PlantWriteSerializer,
        responses={200: PlantSerializer},
    ),
    patch=extend_schema(
        tags=[TAG_PLANTS],
        summary="Update a plant",
        description=(
            "Partial update. Re-pointing `branch_uuid` is allowed only to another "
            "branch owned by the same user."
        ),
        request=PlantUpdateSerializer,
        responses={200: PlantSerializer},
    ),
    delete=extend_schema(
        tags=[TAG_PLANTS],
        summary="Soft-delete a plant",
        responses={204: OpenApiResponse(description="Deleted")},
    ),
)
class PlantDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlantSerializer
    owner_field = "owner"
    lookup_field = "uuid"

    def get_permissions(self):
        from rest_framework.permissions import IsAuthenticated

        return [IsAuthenticated(), IsOwner()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Plant.objects.none()
        return plants_for_user(self.request.user)

    def update(self, request: Request, *args, **kwargs) -> Response:
        partial = kwargs.pop("partial", False)
        plant = self.get_object()
        serializer_class = PlantUpdateSerializer if partial else PlantWriteSerializer
        serializer = serializer_class(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        plant = update_plant(plant=plant, data=serializer.validated_data)
        return Response(PlantSerializer(plant).data)

    def perform_destroy(self, instance: Plant) -> None:
        soft_delete_plant(plant=instance)


class BranchReviewQueueView(generics.ListAPIView):
    """Staff queue for unreviewed branches."""

    serializer_class = BranchSerializer
    permission_classes = (IsStaff,)

    @extend_schema(
        tags=[TAG_BRANCHES],
        summary="List branches waiting for staff review",
        responses={200: BranchSerializer(many=True)},
    )
    def get(self, request: Request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Branch.objects.none()
        return Branch.objects.filter(status=BranchStatus.PENDING).select_related(
            "owner", "reviewed_by"
        )


class BranchReviewView(generics.GenericAPIView):
    """Approve or reject a pending branch."""

    serializer_class = ReviewDecisionSerializer
    permission_classes = (IsStaff,)

    @extend_schema(
        tags=[TAG_BRANCHES],
        summary="Approve or reject a pending branch",
        request=ReviewDecisionSerializer,
        responses={200: BranchSerializer},
    )
    def post(self, request: Request, uuid, *args, **kwargs) -> Response:
        branch = Branch.objects.filter(uuid=uuid, status=BranchStatus.PENDING).first()
        if branch is None:
            raise NotFound("Pending branch not found.")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = review_branch(
            branch=branch,
            reviewer=request.user,
            decision=serializer.validated_data["decision"],
            reason=serializer.validated_data["reason"],
        )
        return Response(BranchSerializer(result).data)


class PlantReviewQueueView(generics.ListAPIView):
    """Staff queue for unreviewed plants."""

    serializer_class = PlantSerializer
    permission_classes = (IsStaff,)

    @extend_schema(
        tags=[TAG_PLANTS],
        summary="List plants waiting for staff review",
        responses={200: PlantSerializer(many=True)},
    )
    def get(self, request: Request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Plant.objects.none()
        return Plant.objects.filter(status=PlantStatus.PENDING).select_related(
            "owner", "branch", "reviewed_by"
        )


class PlantReviewView(generics.GenericAPIView):
    """Approve or reject a pending plant."""

    serializer_class = ReviewDecisionSerializer
    permission_classes = (IsStaff,)

    @extend_schema(
        tags=[TAG_PLANTS],
        summary="Approve or reject a pending plant",
        request=ReviewDecisionSerializer,
        responses={200: PlantSerializer},
    )
    def post(self, request: Request, uuid, *args, **kwargs) -> Response:
        plant = Plant.objects.filter(uuid=uuid, status=PlantStatus.PENDING).first()
        if plant is None:
            raise NotFound("Pending plant not found.")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = review_plant(
            plant=plant,
            reviewer=request.user,
            decision=serializer.validated_data["decision"],
            reason=serializer.validated_data["reason"],
        )
        return Response(PlantSerializer(result).data)
