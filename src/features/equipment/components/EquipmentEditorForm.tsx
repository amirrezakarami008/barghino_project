"use client";

import {
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_CATEGORY_OPTIONS,
  EQUIPMENT_PRICING_MODE_LABELS,
  EQUIPMENT_PRICING_MODE_OPTIONS,
} from "@/features/equipment/constants";
import { formatUnitPrice } from "@/features/equipment/lib/pricing";
import { isEquipmentNameTaken, saveEquipment } from "@/features/equipment/lib/store";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type {
  EquipmentCategory,
  EquipmentItem,
  EquipmentPricingMode,
} from "@/shared/types/equipment";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

interface EquipmentEditorFormProps {
  initial?: EquipmentItem;
}

export function EquipmentEditorForm({ initial }: EquipmentEditorFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<EquipmentCategory>(initial?.category ?? "panel");
  const [pricingMode, setPricingMode] = useState<EquipmentPricingMode>(
    initial?.pricingMode ?? "per_unit",
  );
  const [unitPrice, setUnitPrice] = useState(initial?.unitPriceToman ?? 1_000_000);
  const [capacityW, setCapacityW] = useState(initial?.capacityW ?? 550);
  const [unitsPerKwp, setUnitsPerKwp] = useState(initial?.unitsPerKwp ?? 2);
  const [unitLabel, setUnitLabel] = useState(initial?.unitLabel ?? "عدد");
  const [active, setActive] = useState(initial?.active ?? true);
  const [showInPriceList, setShowInPriceList] = useState(initial?.showInPriceList ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("نام تجهیز الزامی است.");
      return;
    }
    if (!brand.trim()) {
      setError("برند تجهیز را وارد کنید.");
      return;
    }
    if (unitPrice <= 0) {
      setError("قیمت واحد باید بزرگ‌تر از صفر باشد.");
      return;
    }
    if (isEquipmentNameTaken(name, initial?.id)) {
      setError("تجهیزی با این نام قبلاً تعریف شده است.");
      return;
    }

    setSaving(true);

    const item: EquipmentItem = {
      id: initial?.id ?? `eq-custom-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim() || undefined,
      category,
      pricingMode,
      unitPriceToman: Math.round(unitPrice),
      capacityW:
        category === "panel" || category === "inverter" || category === "battery"
          ? Math.max(1, Math.round(capacityW))
          : undefined,
      unitsPerKwp:
        pricingMode === "per_unit" && !(category === "panel" || category === "inverter")
          ? Math.max(0.1, unitsPerKwp)
          : undefined,
      unitLabel: unitLabel.trim() || undefined,
      active,
      showInPriceList,
      source: initial?.source === "seed" ? "custom" : initial?.source ?? "custom",
    };

    saveEquipment(item);
    setSaving(false);
    router.push("/dashboard/equipment");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="نام تجهیز">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً پنل مونوکریستال ۵۵۰ وات"
              className={fieldClass}
            />
          </Field>
          <Field label="برند">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Longi / Huawei / ..."
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="توضیح کوتاه (اختیاری)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="نکته فنی یا کاربرد تجهیز"
            className={fieldClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="دسته‌بندی">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
              className={fieldClass}
            >
              {EQUIPMENT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="نحوه محاسبه قیمت">
            <select
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value as EquipmentPricingMode)}
              className={fieldClass}
            >
              {EQUIPMENT_PRICING_MODE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="قیمت واحد (تومان)">
            <input
              type="number"
              min={0}
              step={50_000}
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
              className={fieldClass}
            />
          </Field>
          <Field label="برچسب واحد">
            <input
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              placeholder="عدد / کیلووات"
              className={fieldClass}
            />
          </Field>
        </div>

        {(category === "panel" || category === "inverter" || category === "battery") && (
          <Field label="توان (وات)">
            <input
              type="number"
              min={1}
              step={50}
              value={capacityW}
              onChange={(e) => setCapacityW(Number(e.target.value) || 0)}
              className={fieldClass}
            />
          </Field>
        )}

        {pricingMode === "per_unit" &&
          category !== "panel" &&
          category !== "inverter" &&
          category !== "battery" && (
            <Field label="تعداد تقریبی به‌ازای هر کیلووات">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={unitsPerKwp}
                onChange={(e) => setUnitsPerKwp(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </Field>
          )}

        <div className="flex flex-wrap gap-4">
          <Toggle
            checked={active}
            onChange={setActive}
            label="فعال در محاسبه هزینه"
            hint="در ماشین‌حساب نصب لحاظ شود"
          />
          <Toggle
            checked={showInPriceList}
            onChange={setShowInPriceList}
            label="نمایش در لیست قیمت"
            hint="برای بازدیدکنندگان عمومی"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن تجهیز"}
          </Button>
          <Button href="/dashboard/equipment" variant="outline" type="button">
            انصراف
          </Button>
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-amber-50 p-5 shadow-sm">
        <p className="text-xs font-semibold text-brand-700">پیش‌نمایش</p>
        <div className="rounded-xl bg-white/90 p-4 ring-1 ring-slate-100">
          <p className="text-xs text-slate-500">{EQUIPMENT_CATEGORY_LABELS[category]}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
            {name.trim() || "نام تجهیز"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{brand.trim() || "برند"}</p>
          <p className="mt-3 font-display text-2xl font-extrabold text-brand-700">
            {formatUnitPrice(unitPrice)}
            <span className="ms-1 text-sm font-medium text-slate-500">تومان</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {EQUIPMENT_PRICING_MODE_LABELS[pricingMode]}
            {unitLabel ? ` · ${unitLabel}` : ""}
          </p>
        </div>
        <p className="text-[11px] leading-5 text-slate-500">
          تجهیزات فعال مبنای برآورد هزینه در ماشین‌حساب نصب هستند. لیست قیمت فقط
          آیتم‌های علامت‌خورده را نشان می‌دهد.
        </p>
      </aside>
    </form>
  );
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex min-w-[220px] flex-1 items-start gap-3 rounded-xl border px-4 py-3 text-start transition",
        checked ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-slate-50",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white",
          checked ? "bg-brand-600" : "bg-slate-300",
        )}
      >
        {checked ? "✓" : ""}
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="mt-0.5 block text-[11px] text-slate-500">{hint}</span>
      </span>
    </button>
  );
}
