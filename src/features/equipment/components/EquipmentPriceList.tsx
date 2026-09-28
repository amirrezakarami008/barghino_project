"use client";

import { EQUIPMENT_CATEGORY_LABELS } from "@/features/equipment/constants";
import { usePriceListEquipment } from "@/features/equipment/hooks/useEquipment";
import {
  formatUnitPrice,
  quantityForEquipment,
} from "@/features/equipment/lib/pricing";
import { cn } from "@/shared/lib/utils";
import type { EquipmentCategory, EquipmentCostLine } from "@/shared/types/equipment";
import { useMemo, useState } from "react";

const CATEGORY_ORDER: EquipmentCategory[] = [
  "panel",
  "inverter",
  "mounting",
  "cabling",
  "protection",
  "battery",
  "other",
];

interface EquipmentPriceListProps {
  capacityKwp?: number;
  /** خطوط هزینه برآورد فعلی — برای نمایش تعداد واقعی استفاده‌شده */
  costLines?: EquipmentCostLine[];
}

export function EquipmentPriceList({ capacityKwp = 0, costLines = [] }: EquipmentPriceListProps) {
  const { items } = usePriceListEquipment();
  const [expanded, setExpanded] = useState(false);

  const qtyById = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of costLines) map.set(line.item.id, line.quantity);
    return map;
  }, [costLines]);

  const grouped = useMemo(() => {
    const map = new Map<EquipmentCategory, typeof items>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((category) => ({
      category,
      label: EQUIPMENT_CATEGORY_LABELS[category],
      items: map.get(category)!,
    }));
  }, [items]);

  if (!items.length) return null;

  const previewCount = 4;
  const flat = grouped.flatMap((g) =>
    g.items.map((item) => ({ ...item, categoryLabel: g.label })),
  );
  const visible = expanded ? flat : flat.slice(0, previewCount);
  const hasMore = flat.length > previewCount;

  return (
    <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-bold text-slate-900">لیست قیمت تجهیزات</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            قیمت واحد و تعداد لازم برای ظرفیت فعلی
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-100">
          {items.length.toLocaleString("fa-IR")} قلم
        </span>
      </div>

      <ul className="divide-y divide-slate-100">
        {visible.map((item) => {
          const usedQty = qtyById.get(item.id);
          const previewQty =
            usedQty ??
            (item.active && capacityKwp > 0
              ? quantityForEquipment(item, capacityKwp)
              : undefined);
          const unit = item.unitLabel ?? "واحد";

          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50/80 sm:px-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-800">{item.name}</span>
                  {usedQty != null && (
                    <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 ring-1 ring-brand-100">
                      × {usedQty.toLocaleString("fa-IR")} {unit}
                    </span>
                  )}
                  {item.active && usedQty == null && (
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      در کاتالوگ فعال
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {item.categoryLabel} · {item.brand}
                  {previewQty != null && usedQty == null
                    ? ` · حدود ${previewQty.toLocaleString("fa-IR")} ${unit}`
                    : ""}
                </p>
              </div>
              <div className="shrink-0 text-end">
                <p className="font-display text-sm font-bold tabular-nums text-slate-900">
                  {formatUnitPrice(item.unitPriceToman)}
                </p>
                <p className="text-[10px] text-slate-400">تومان / {unit}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "flex w-full items-center justify-center border-t border-slate-100 px-4 py-2.5 text-xs font-semibold transition",
            "text-brand-700 hover:bg-brand-50/60",
          )}
        >
          {expanded ? "بستن لیست" : `مشاهده ${flat.length - previewCount} قلم دیگر`}
        </button>
      )}
    </div>
  );
}
