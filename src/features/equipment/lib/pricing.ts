import { DEFAULT_COST_PER_KWP } from "@/features/equipment/constants";
import type {
  EquipmentCostEstimate,
  EquipmentCostLine,
  EquipmentItem,
} from "@/shared/types/equipment";

/** تعداد واحد لازم برای ظرفیت هدف */
export function quantityForEquipment(item: EquipmentItem, capacityKwp: number): number {
  if (item.pricingMode === "fixed") return 1;
  if (item.pricingMode === "per_kwp") return capacityKwp;

  if (item.capacityW && item.capacityW > 0) {
    return Math.max(1, Math.ceil((capacityKwp * 1000) / item.capacityW));
  }

  const perKwp = item.unitsPerKwp && item.unitsPerKwp > 0 ? item.unitsPerKwp : 1;
  return Math.max(1, Math.ceil(capacityKwp * perKwp));
}

export function estimateEquipmentCost(
  capacityKwp: number,
  items: EquipmentItem[],
): EquipmentCostEstimate {
  const active = items.filter((item) => item.active);
  const safeCapacity = Math.max(0, capacityKwp);

  if (!active.length || safeCapacity <= 0) {
    const totalToman = safeCapacity * DEFAULT_COST_PER_KWP;
    return {
      lines: [],
      totalToman,
      costPerKwpToman: DEFAULT_COST_PER_KWP,
    };
  }

  // برای پنل و اینورتر فقط اولین قلم فعال هر دسته لحاظ می‌شود
  const exclusiveCategories = new Set(["panel", "inverter"]);
  const seenExclusive = new Set<string>();
  const selected = active.filter((item) => {
    if (!exclusiveCategories.has(item.category)) return true;
    if (seenExclusive.has(item.category)) return false;
    seenExclusive.add(item.category);
    return true;
  });

  const lines: EquipmentCostLine[] = selected.map((item) => {
    const quantity = quantityForEquipment(item, safeCapacity);
    return {
      item,
      quantity,
      lineTotalToman: Math.round(item.unitPriceToman * quantity),
    };
  });

  const totalToman = lines.reduce((sum, line) => sum + line.lineTotalToman, 0);

  return {
    lines,
    totalToman,
    costPerKwpToman: safeCapacity > 0 ? Math.round(totalToman / safeCapacity) : 0,
  };
}

export function formatEquipmentMoney(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} میلیارد`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} میلیون`;
  return n.toLocaleString("fa-IR");
}

export function formatUnitPrice(n: number): string {
  return n.toLocaleString("fa-IR");
}
