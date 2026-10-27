from django.contrib import admin

from apps.files.models import StoredFile


@admin.register(StoredFile)
class StoredFileAdmin(admin.ModelAdmin):
    list_display = (
        "uuid",
        "original_name",
        "owner",
        "purpose",
        "visibility",
        "size_bytes",
        "created_at",
        "deleted_at",
    )
    list_filter = ("purpose", "visibility", "content_type")
    search_fields = ("uuid", "original_name", "owner__phone")
    readonly_fields = (
        "uuid",
        "owner",
        "file",
        "original_name",
        "content_type",
        "size_bytes",
        "created_at",
        "updated_at",
        "deleted_at",
    )
    ordering = ("-created_at",)

    def get_queryset(self, request):
        return StoredFile.all_objects.select_related("owner")
