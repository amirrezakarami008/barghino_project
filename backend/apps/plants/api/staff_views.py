"""Staff inventory management; owner-facing endpoints stay owner scoped."""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, serializers, status
from rest_framework.exceptions import NotFound
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.openapi import TAG_PLANTS
from apps.core.permissions import IsStaff
from apps.plants.api.serializers import PlantSerializer, PlantUpdateSerializer, PlantWriteSerializer
from apps.plants.models import Branch, Plant
from apps.plants.services.plants import create_plant, soft_delete_plant, update_plant


class InventoryQuerySerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=("all", "pending", "active", "inactive", "maintenance"), default="pending"
    )
    owner_uuid = serializers.UUIDField(required=False)


def inventory_filters(queryset, params, *, branch=False):
    query = InventoryQuerySerializer(data=params)
    query.is_valid(raise_exception=True)
    values = query.validated_data
    selected = values["status"]
    if branch and selected == "maintenance":
        raise serializers.ValidationError({"status": "Select a valid branch status."})
    if selected != "all":
        queryset = queryset.filter(status=selected)
    if "owner_uuid" in values:
        queryset = queryset.filter(owner__uuid=values["owner_uuid"])
    return queryset.order_by("-created_at", "-id")


@extend_schema_view(
    get=extend_schema(tags=[TAG_PLANTS], summary="Get any owned plant (staff)"),
    put=extend_schema(
        tags=[TAG_PLANTS], request=PlantWriteSerializer, responses={200: PlantSerializer}
    ),
    patch=extend_schema(
        tags=[TAG_PLANTS], request=PlantUpdateSerializer, responses={200: PlantSerializer}
    ),
    delete=extend_schema(tags=[TAG_PLANTS], summary="Soft-delete a plant (staff)"),
)
class StaffPlantDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsStaff,)
    serializer_class = PlantSerializer
    lookup_field = "uuid"
    queryset = Plant.objects.select_related("owner", "branch", "reviewed_by")

    def update(self, request: Request, *args, **kwargs) -> Response:
        plant = self.get_object()
        partial = kwargs.pop("partial", False)
        schema = PlantUpdateSerializer if partial else PlantWriteSerializer
        serializer = schema(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        # The existing domain service forbids moving a plant to another owner's branch.
        result = update_plant(plant=plant, data=serializer.validated_data)
        return Response(PlantSerializer(result).data)

    def perform_destroy(self, instance: Plant) -> None:
        soft_delete_plant(plant=instance)


def create_staff_plant(request: Request) -> Response:
    serializer = PlantWriteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    branch = (
        Branch.objects.select_related("owner")
        .filter(uuid=serializer.validated_data["branch_uuid"])
        .first()
    )
    if branch is None:
        raise NotFound("Branch not found.")
    result = create_plant(owner=branch.owner, data=serializer.validated_data)
    return Response(PlantSerializer(result).data, status=status.HTTP_201_CREATED)
