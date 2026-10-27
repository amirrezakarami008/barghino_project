"""Read queries for the equipment catalog."""

from __future__ import annotations

from django.db.models import QuerySet

from apps.catalog.models import Equipment, SellPlan


def active_equipment() -> QuerySet[Equipment]:
    return Equipment.objects.filter(is_active=True).order_by("created_at", "pk")


def all_equipment() -> QuerySet[Equipment]:
    return Equipment.objects.order_by("created_at", "pk")


def equipment_for_request(*, is_staff: bool) -> QuerySet[Equipment]:
    return all_equipment() if is_staff else active_equipment()


def all_plans() -> QuerySet[SellPlan]:
    return SellPlan.objects.order_by("sort_order", "created_at", "pk")


def active_plans() -> QuerySet[SellPlan]:
    return all_plans().filter(is_active=True)


def plans_for_request(*, is_staff: bool) -> QuerySet[SellPlan]:
    return all_plans() if is_staff else active_plans()
