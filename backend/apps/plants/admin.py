from django.contrib import admin

from apps.plants.models import Branch, Plant


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = (
        "uuid",
        "name",
        "meter_number",
        "owner",
        "status",
        "created_at",
        "deleted_at",
    )
    list_filter = ("status",)
    search_fields = ("uuid", "name", "meter_number", "owner__phone")
    readonly_fields = ("uuid", "created_at", "updated_at", "deleted_at")
    ordering = ("-created_at",)

    def get_queryset(self, request):
        return Branch.all_objects.select_related("owner")


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = (
        "uuid",
        "name",
        "owner",
        "branch",
        "capacity_kwp",
        "status",
        "commissioned_at",
        "created_at",
        "deleted_at",
    )
    list_filter = ("status",)
    search_fields = ("uuid", "name", "owner__phone", "branch__meter_number")
    readonly_fields = ("uuid", "created_at", "updated_at", "deleted_at")
    ordering = ("-created_at",)
    raw_id_fields = ("owner", "branch")

    def get_queryset(self, request):
        return Plant.all_objects.select_related("owner", "branch")
