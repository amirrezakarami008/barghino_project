"use client";

import {
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_PRICING_MODE_LABELS,
} from "@/features/equipment/constants";
import { useEquipment } from "@/features/equipment/hooks/useEquipment";
import { formatUnitPrice } from "@/features/equipment/lib/pricing";
import {
  deleteEquipment,
  saveEquipment,
  toggleEquipmentActive,
} from "@/features/equipment/lib/store";
import { DashboardPage, EmptyState, Panel } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { EquipmentCategory, EquipmentItem } from "@/shared/types/equipment";
import { SEED_EQUIPMENT } from "@/features/equipment/constants";
import { useMemo, useState } from "react";

type Tab = "all" | "active" | "inactive" | EquipmentCategory;

export function AdminEquipmentManager() {
  const { items } = useEquipment();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const active = items.filter((i) => i.active).length;
    const inPriceList = items.filter((i) => i.showInPriceList).length;
    const custom = items.filter((i) => {
      const isSeedId = SEED_EQUIPMENT.some((s) => s.id === i.id);
      return i.source === "custom" && !isSeedId;
    }).length;
    return { total: items.length, active, inPriceList, custom };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (tab === "active" && !item.active) return false;
      if (tab === "inactive" && item.active) return false;
      if (
        tab !== "all" &&
        tab !== "active" &&
        tab !== "inactive" &&
        item.category !== tab
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        EQUIPMENT_CATEGORY_LABELS[item.category].includes(query.trim())
      );
    });
  }, [items, tab, query]);

  const handleDelete = (item: EquipmentItem) => {
    const isSeed = SEED_EQUIPMENT.some((s) => s.id === item.id);
    const message = isSeed
      ? `تغییرات «${item.name}» به مقدار اولیه برگردد؟`
      : `تجهیز «${item.name}» حذف شود؟`;
    if (!window.confirm(message)) return;
    deleteEquipment(item.id);
  };

  const handleTogglePriceList = (item: EquipmentItem) => {
    saveEquipment({ ...item, showInPriceList: !item.showInPriceList });
  };

  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="مدیریت تجهیزات" subtitle="دسترسی محدود">
        <EmptyState
          title="دسترسی ادمین لازم است"
          description="این بخش فقط برای مدیران سامانه در دسترس است."
          action={<Button href="/dashboard">بازگشت به داشبورد</Button>}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="مدیریت تجهیزات"
      subtitle="تعریف، قیمت‌گذاری و فعال‌سازی تجهیزات نصب خورشیدی"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "کل تجهیزات", value: stats.total, tone: "text-slate-900" },
          { label: "فعال در محاسبه", value: stats.active, tone: "text-emerald-600" },
          { label: "در لیست قیمت", value: stats.inPriceList, tone: "text-brand-600" },
          { label: "تعریف‌شده توسط ادمین", value: stats.custom, tone: "text-amber-600" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={cn("mt-1 font-display text-3xl font-extrabold", item.tone)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "همه"],
              ["active", "فعال"],
              ["inactive", "غیرفعال"],
              ["panel", "پنل"],
              ["inverter", "اینورتر"],
              ["mounting", "سازه"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Button href="/dashboard/equipment/new">+ تجهیز جدید</Button>
      </div>

      <Panel className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در نام یا برند..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:max-w-sm"
          />
          <Button href="/solar-home#calculator" variant="outline" size="sm">
            مشاهده در ماشین‌حساب
          </Button>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState
          title="تجهیزی در این فیلتر نیست"
          description="یک تجهیز جدید تعریف کنید یا فیلتر را تغییر دهید."
          action={<Button href="/dashboard/equipment/new">افزودن تجهیز</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isSeed = SEED_EQUIPMENT.some((s) => s.id === item.id);
            const isOverridden = isSeed && item.source === "custom";

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusPill
                        label={item.active ? "فعال در محاسبه" : "غیرفعال"}
                        tone={item.active ? "success" : "muted"}
                      />
                      <StatusPill
                        label={EQUIPMENT_CATEGORY_LABELS[item.category]}
                        tone="brand"
                      />
                      {item.showInPriceList && (
                        <StatusPill label="لیست قیمت" tone="accent" />
                      )}
                      {isOverridden && <StatusPill label="ویرایش‌شده" tone="warning" />}
                      {!isSeed && <StatusPill label="ادمین" tone="brand" />}
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.brand}
                      {item.capacityW ? ` · ${item.capacityW.toLocaleString("fa-IR")} وات` : ""}
                      {item.description ? ` — ${item.description}` : ""}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {EQUIPMENT_PRICING_MODE_LABELS[item.pricingMode]}
                      {item.unitLabel ? ` · واحد: ${item.unitLabel}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
                    <p className="font-display text-xl font-extrabold text-slate-900">
                      {formatUnitPrice(item.unitPriceToman)}
                      <span className="ms-1 text-xs font-medium text-slate-500">تومان</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleEquipmentActive(item.id, !item.active)}
                      >
                        {item.active ? "غیرفعال کردن" : "فعال کردن"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePriceList(item)}
                      >
                        {item.showInPriceList ? "مخفی از لیست" : "نمایش در لیست"}
                      </Button>
                      <Button href={`/dashboard/equipment/${item.id}/edit`} size="sm">
                        ویرایش
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(item)}>
                        {isSeed ? "بازنشانی" : "حذف"}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardPage>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "brand" | "accent" | "muted";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    brand: "bg-brand-50 text-brand-700 ring-brand-100",
    accent: "bg-orange-50 text-orange-700 ring-orange-100",
    muted: "bg-slate-50 text-slate-500 ring-slate-100",
  };

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", styles[tone])}>
      {label}
    </span>
  );
}
