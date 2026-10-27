from __future__ import annotations

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.request import Request
from rest_framework.response import Response

from apps.contracts.api.serializers import (
    ContractDraftCreateSerializer,
    ContractReviewSerializer,
    ContractSerializer,
    ContractSignSerializer,
)
from apps.contracts.models import Contract
from apps.contracts.selectors import contracts_awaiting_company_review, contracts_for_user
from apps.contracts.services.drafts import create_contract_draft
from apps.contracts.services.signing import review_contract, sign_contract
from apps.core.openapi import TAG_CONTRACTS
from apps.core.permissions import IsStaff


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_CONTRACTS],
        summary="List my electricity purchase contracts",
        responses={200: ContractSerializer(many=True)},
    ),
    post=extend_schema(
        tags=[TAG_CONTRACTS],
        summary="Create a draft contract for an approved plant",
        description=(
            "Creates a draft only when both the user's branch and plant are approved. "
            "Plan terms are copied into the contract so later plan edits do not change this draft."
        ),
        request=ContractDraftCreateSerializer,
        responses={201: ContractSerializer},
    ),
)
class ContractListCreateView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ContractSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Contract.objects.none()
        return contracts_for_user(self.request.user)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = ContractDraftCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contract = create_contract_draft(
            owner=request.user,
            plant_uuid=serializer.validated_data["plant_uuid"],
            plan_uuid=serializer.validated_data["plan_uuid"],
        )
        contract = contracts_for_user(request.user).get(pk=contract.pk)
        return Response(ContractSerializer(contract).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=[TAG_CONTRACTS],
    summary="Get my contract draft",
    responses={200: ContractSerializer},
)
class ContractDetailView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ContractSerializer
    lookup_field = "uuid"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Contract.objects.none()
        return contracts_for_user(self.request.user)


class ContractSignView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ContractSignSerializer

    @extend_schema(
        tags=[TAG_CONTRACTS],
        summary="Sign a draft electricity purchase contract",
        description=(
            "The frontend collects the electronic signature and uploads it as a private image "
            "with purpose=contract. The backend records the file, accepted document version and "
            "client-provided SHA-256 digest, then moves the contract to company review."
        ),
        request=ContractSignSerializer,
        responses={200: ContractSerializer},
    )
    def post(self, request: Request, uuid, *args, **kwargs) -> Response:
        contract = contracts_for_user(request.user).filter(uuid=uuid).first()
        if contract is None:
            raise NotFound("Contract not found.")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        sign_contract(
            contract=contract,
            signer=request.user,
            signature_file_uuid=data["signature_file_uuid"],
            terms_version=data["terms_version"],
            terms_sha256=data["terms_sha256"],
        )
        signed = contracts_for_user(request.user).get(uuid=uuid)
        return Response(ContractSerializer(signed).data)


class ContractReviewQueueView(generics.ListAPIView):
    permission_classes = (IsStaff,)
    serializer_class = ContractSerializer

    @extend_schema(
        tags=[TAG_CONTRACTS],
        summary="List signed contracts awaiting company review",
        responses={200: ContractSerializer(many=True)},
    )
    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Contract.objects.none()
        return contracts_awaiting_company_review()


class ContractReviewView(generics.GenericAPIView):
    permission_classes = (IsStaff,)
    serializer_class = ContractReviewSerializer

    @extend_schema(
        tags=[TAG_CONTRACTS],
        summary="Approve or reject a signed contract",
        description=(
            "Approval activates the contract. Rejection requires a reason and closes this signed "
            "version; the seller can correct the relevant data and create a new draft."
        ),
        request=ContractReviewSerializer,
        responses={200: ContractSerializer},
    )
    def post(self, request: Request, uuid, *args, **kwargs) -> Response:
        contract = contracts_awaiting_company_review().filter(uuid=uuid).first()
        if contract is None:
            raise NotFound("Signed contract awaiting review not found.")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = review_contract(
            contract=contract,
            reviewer=request.user,
            decision=serializer.validated_data["decision"],
            reason=serializer.validated_data["reason"],
        )
        result = contracts_for_user(result.owner).get(pk=result.pk)
        return Response(ContractSerializer(result).data)
