from __future__ import annotations

from rest_framework import serializers

from apps.files.models import FilePurpose, FileVisibility, StoredFile
from apps.files.services.access import access_url_expires_at, build_access_url


class StoredFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField(
        help_text="Time-limited or authenticated URL to fetch bytes. Never a raw storage key.",
    )
    url_expires_at = serializers.SerializerMethodField(
        help_text="ISO-8601 expiry hint for private URLs; null for public files.",
    )

    class Meta:
        model = StoredFile
        fields = (
            "uuid",
            "original_name",
            "content_type",
            "size_bytes",
            "purpose",
            "visibility",
            "url",
            "url_expires_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
        extra_kwargs = {
            "uuid": {"help_text": "Public file id (use in URLs)."},
            "original_name": {"help_text": "Original client filename."},
            "content_type": {"help_text": "Resolved MIME type stored at upload."},
            "size_bytes": {"help_text": "Size in bytes."},
            "purpose": {"help_text": "Upload category controlling allow-list and size cap."},
            "visibility": {"help_text": "`private` (default) or `public` (staff-only to set)."},
        }

    def get_url(self, obj: StoredFile) -> str:
        request = self.context.get("request")
        return build_access_url(obj, request=request)

    def get_url_expires_at(self, obj: StoredFile) -> str | None:
        return access_url_expires_at(obj)


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(
        allow_empty_file=False,
        help_text="Binary file part (`multipart/form-data`).",
    )
    purpose = serializers.ChoiceField(
        choices=FilePurpose.choices,
        default=FilePurpose.OTHER,
        help_text=(
            "One of: document, national_id, contract, install_media, avatar, content, other."
        ),
    )
    visibility = serializers.ChoiceField(
        choices=FileVisibility.choices,
        default=FileVisibility.PRIVATE,
        required=False,
        help_text="Defaults to private. Public uploads require staff.",
    )
