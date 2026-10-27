from django.contrib import admin

from apps.catalog.models import Equipment, SellPlan


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "brand",
        "price_toman",
        "price_mode",
        "is_active",
        "show_in_price_list",
    )
    list_filter = ("category", "price_mode", "is_active", "show_in_price_list")
    search_fields = ("name", "brand", "uuid")
    readonly_fields = ("uuid", "created_at", "updated_at", "deleted_at")


@admin.register(SellPlan)
class SellPlanAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "commitment_kwh",
        "rate_toman_per_kwh",
        "is_active",
        "is_recommended",
        "sort_order",
    )
    list_filter = ("is_active", "is_recommended")
    search_fields = ("name", "description")
    ordering = ("sort_order", "created_at", "pk")
    readonly_fields = ("uuid", "created_at", "updated_at", "deleted_at")
