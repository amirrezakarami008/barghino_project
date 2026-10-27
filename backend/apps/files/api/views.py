from __future__ import annotations

from django.http import FileResponse
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotAuthenticated, NotFound
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.openapi import TAG_FILES
from apps.core.permissions import IsOwnerOrStaff
from apps.core.throttling import FileUploadRateThrottle
from apps.files.api.serializers import FileUploadSerializer, StoredFileSerializer
from apps.files.models import FileVisibility, StoredFile
from apps.files.selectors import files_for_user, get_readable_file
from apps.files.services.access import open_file_for_download
from apps.files.services.delete import soft_delete_file
from apps.files.services.upload import upload_file


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_FILES],
        summary="List my files",
        description=(
            "Paginated list of files owned by the authenticated user (soft-deleted excluded). "
            "Staff listing is still scoped to the caller's own uploads; use detail by UUID for "
            "another user's file when staff."
        ),
        responses={200: StoredFileSerializer(many=True)},
    ),
    post=extend_schema(
        tags=[TAG_FILES],
        summary="Upload a file",
        description=(
            "Multipart upload. Required: `file`. Optional: `purpose` (default `other`), "
            "`visibility` (default `private`).\n\n"
            "MIME type and size are validated per purpose "
            "(e.g. documents: PDF/JPEG/PNG/WebP; `install_media` up to 25 MiB including MP4/WebM). "
            "Only staff may set `visibility=public`. "
            "Response includes an access `url` (never a raw storage key)."
        ),
        request=FileUploadSerializer,
        responses={201: StoredFileSerializer},
    ),
)
class StoredFileListCreateView(generics.ListCreateAPIView):
    serializer_class = StoredFileSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_throttles(self):
        if self.request.method == "POST":
            return [FileUploadRateThrottle()]
        return []

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return StoredFile.objects.none()
        return files_for_user(self.request.user)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        stored = upload_file(
            owner=request.user,
            uploaded=serializer.validated_data["file"],
            purpose=serializer.validated_data["purpose"],
            visibility=serializer.validated_data["visibility"],
            acting_user=request.user,
        )
        return Response(
            StoredFileSerializer(stored, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_FILES],
        summary="Get file metadata",
        description=(
            "Return metadata and a fresh access `url` for a file by public `uuid`. "
            "Owner or staff only. Soft-deleted files return 404."
        ),
        responses={200: StoredFileSerializer},
    ),
    delete=extend_schema(
        tags=[TAG_FILES],
        summary="Soft-delete a file",
        description=(
            "Marks the file deleted (`deleted_at`). It disappears from list/detail/content. "
            "The blob may remain on disk/object storage until a later hard-delete/cleanup job."
        ),
        responses={204: OpenApiResponse(description="Deleted")},
    ),
)
class StoredFileDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = StoredFileSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrStaff)
    owner_field = "owner"
    lookup_field = "uuid"
    http_method_names = ["get", "delete", "head", "options"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return StoredFile.objects.none()
        user = self.request.user
        if user.is_staff:
            return StoredFile.objects.select_related("owner")
        return files_for_user(user)

    def perform_destroy(self, instance: StoredFile) -> None:
        soft_delete_file(instance)


class StoredFileContentView(APIView):
    """Stream file bytes. Public files are open; private need owner/staff JWT."""

    permission_classes = (permissions.AllowAny,)

    @extend_schema(
        tags=[TAG_FILES],
        auth=[],
        summary="Download / stream file bytes",
        description=(
            "Streams the raw file. **Public** files are readable without authentication. "
            "**Private** files require a valid JWT for the owner (or staff). "
            "Unauthenticated access to an existing private file returns `401`; "
            "missing or forbidden authenticated access returns `404`.\n\n"
            "In local filesystem mode this is the primary download path for private files. "
            "With S3/MinIO, clients may instead use the signed `url` from metadata."
        ),
        parameters=[
            OpenApiParameter(
                name="uuid",
                type=str,
                location=OpenApiParameter.PATH,
                description="Public file UUID.",
            ),
        ],
        responses={
            (200, "application/octet-stream"): OpenApiResponse(description="File bytes"),
            401: OpenApiResponse(description="Authentication required for private file"),
            404: OpenApiResponse(description="Not found or not readable"),
        },
    )
    def get(self, request: Request, uuid) -> FileResponse:
        user = request.user if request.user and request.user.is_authenticated else None
        stored = get_readable_file(user=user, file_uuid=uuid)
        if stored is not None:
            return self._file_response(stored)

        exists = StoredFile.objects.filter(uuid=uuid).exists()
        if not exists:
            raise NotFound()
        if user is None:
            raise NotAuthenticated()
        raise NotFound()

    def _file_response(self, stored: StoredFile) -> FileResponse:
        handle = open_file_for_download(stored)
        as_attachment = stored.visibility == FileVisibility.PRIVATE
        response = FileResponse(
            handle,
            as_attachment=as_attachment,
            filename=stored.original_name,
            content_type=stored.content_type or "application/octet-stream",
        )
        response["Content-Length"] = str(stored.size_bytes)
        return response
