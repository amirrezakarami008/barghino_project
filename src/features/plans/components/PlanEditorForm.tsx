"use client";

import {
  createPlanId,
  isPlanNameTaken,
  savePlan,
} from "@/features/plans/lib/store";
import type { ContractPlan } from "@/features/contracts/types";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

interface PlanEditorFormProps {
  initial?: ContractPlan;
}

export function PlanEditorForm({ initial }: PlanEditorFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [volume, setVolume] = useState(initial?.volume ?? "");
  const [rate, setRate] = useState(initial?.rate ?? "");
  const [savings, setSavings] = useState(initial?.savings ?? "");
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join("\n"));
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 10);
  const [active, setActive] = useState(initial?.active ?? true);
  const [recommended, setRecommended] = useState(initial?.recommended ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const features = featuresText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("نام پلن الزامی است.");
      return;
    }
    if (!tagline.trim()) {
      setError("خلاصه پلن را وارد کنید.");
      return;
    }
    if (!volume.trim() || !rate.trim()) {
      setError("حجم و نرخ پلن الزامی است.");
      return;
    }
    if (!features.length) {
      setError("حداقل یک ویژگی برای پلن بنویسید.");
      return;
    }
    if (isPlanNameTaken(name, initial?.id)) {
      setError("پلنی با این نام قبلاً تعریف شده است.");
      return;
    }

    setSaving(true);
    const plan: ContractPlan = {
      id: initial?.id ?? createPlanId(name),
      name: name.trim(),
      tagline: tagline.trim(),
      volume: volume.trim(),
      rate: rate.trim(),
      savings: savings.trim() || "—",
      features,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 10,
      active,
      recommended,
      source: initial?.source === "seed" ? "custom" : initial?.source ?? "custom",
    };

    savePlan(plan);
    setSaving(false);
    router.push("/dashboard/plans");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="نام پلن">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً استاندارد"
              className={fieldClass}
            />
          </Field>
          <Field label="ترتیب نمایش">
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="خلاصه / تگ‌لاین">
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="پیشنهاد برقینو برای اکثر خانه‌ها"
            className={fieldClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="حجم توافقی">
            <input
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="۷۲۰ kWh/ماه"
              className={fieldClass}
            />
          </Field>
          <Field label="نرخ">
            <input
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="۷٬۰۰۰ تومان/kWh"
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="مزیت نسبت به پایه">
          <input
            value={savings}
            onChange={(e) => setSavings(e.target.value)}
            placeholder="≈۳× پایه"
            className={fieldClass}
          />
        </Field>

        <Field label="ویژگی‌ها (هر خط یک مورد)">
          <textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={5}
            placeholder={"خرید فصلی با قرارداد رسمی\nپرداخت حداکثر ۲ ماهه"}
            className={fieldClass}
          />
        </Field>

        <div className="flex flex-wrap gap-4">
          <Toggle
            checked={active}
            onChange={setActive}
            label="فعال در انتخاب قرارداد"
            hint="در ویزارد امضا نمایش داده شود"
          />
          <Toggle
            checked={recommended}
            onChange={setRecommended}
            label="پلن پیشنهادی"
            hint="با بج «پیشنهادی» مشخص می‌شود"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن پلن"}
          </Button>
          <Button href="/dashboard/plans" variant="outline" type="button">
            انصراف
          </Button>
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-amber-50 p-5 shadow-sm">
        <p className="text-xs font-semibold text-brand-700">پیش‌نمایش کارت پلن</p>
        <div className="relative rounded-2xl border border-brand-200 bg-white/90 p-4 shadow-sm">
          {recommended && (
            <span className="absolute -top-2 left-3 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
              پیشنهادی
            </span>
          )}
          <p className="font-display text-lg font-black text-slate-900">
            {name.trim() || "نام پلن"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {tagline.trim() || "خلاصه پلن"}
          </p>
          <div className="mt-4 space-y-1 text-xs">
            <p className="font-bold text-slate-800">{rate.trim() || "نرخ"}</p>
            <p className="text-slate-600">حجم: {volume.trim() || "—"}</p>
            <p className="text-emerald-700">{savings.trim() || "—"}</p>
          </div>
          <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
            {(features.length ? features : ["ویژگی نمونه"]).map((feature) => (
              <li key={feature} className="text-[11px] text-slate-600">
                • {feature}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] leading-5 text-slate-500">
          پلن‌های فعال در مرحله «انتخاب پلن» هنگام امضای قرارداد به کاربر نشان داده می‌شوند.
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
