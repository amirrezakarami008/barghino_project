"""Server-side cost estimate based on the active equipment catalog."""

from __future__ import annotations

from decimal import ROUND_CEILING, Decimal

from apps.catalog.models import Equipment, EquipmentCategory, EquipmentPriceMode
from apps.catalog.selectors import active_equipment


def _ceil(value: Decimal) -> int:
    return int(value.to_integral_value(rounding=ROUND_CEILING))


def estimate_equipment_cost(*, capacity_kwp: Decimal) -> dict:
    """Price first active panel/inverter and every other active catalog item."""
    selected: list[Equipment] = []
    chosen_single_categories: set[str] = set()
    for item in active_equipment():
        if item.category in {EquipmentCategory.PANEL, EquipmentCategory.INVERTER}:
            if item.category in chosen_single_categories:
                continue
            chosen_single_categories.add(item.category)
        selected.append(item)

    breakdown = []
    total_toman = 0
    for item in selected:
        if item.price_mode == EquipmentPriceMode.PER_KWP:
            quantity = capacity_kwp
            line_total = _ceil(capacity_kwp * item.price_toman)
        elif item.price_mode == EquipmentPriceMode.PER_UNIT:
            quantity = _ceil(capacity_kwp * item.units_per_kwp)
            line_total = quantity * item.price_toman
        else:
            quantity = 1
            line_total = item.price_toman
        breakdown.append(
            {
                "equipment_uuid": str(item.uuid),
                "name": item.name,
                "category": item.category,
                "price_mode": item.price_mode,
                "unit_price_toman": item.price_toman,
                "quantity": quantity,
                "total_toman": line_total,
            }
        )
        total_toman += line_total

    return {
        "capacity_kwp": capacity_kwp,
        "items": breakdown,
        "total_toman": total_toman,
    }
