"use client";

import { SEED_PLANS } from "@/features/plans/constants";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { deletePlan, togglePlanActive } from "@/features/plans/lib/store";
import { DashboardPage, EmptyState, Panel } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import type { ContractPlan } from "@/features/contracts/types";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { useMemo, useState } from "react";

type Tab = "all" | "active" | "inactive";

export function AdminPlansManager() {
  const { plans } = usePlans();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const active = plans.filter((p) => p.active).length;
    const recommended = plans.filter((p) => p.recommended).length;
    const custom = plans.filter((p) => {
      const isSeed = SEED_PLANS.some((s) => s.id === p.id);
      return p.source === "custom" && !isSeed;
    }).length;
    return { total: plans.length, active, recommended, custom };
  }, [plans]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans.filter((plan) => {
      if (tab === "active" && !plan.active) return false;
      if (tab === "inactive" && plan.active) return false;
      if (!q) return true;
      return (
        plan.name.toLowerCase().includes(q) ||
        plan.tagline.toLowerCase().includes(q) ||
        plan.rate.toLowerCase().includes(q)
      );
    });
  }, [plans, tab, query]);

  const handleDelete = (plan: ContractPlan) => {
    const isSeed = SEED_PLANS.some((s) => s.id === plan.id);
    const message = isSeed
      ? `تغییرات «${plan.name}» به مقدار اولیه برگردد؟`
      : `پلن «${plan.name}» حذف شود؟`;
    if (!window.confirm(message)) return;
    deletePlan(plan.id);
  };

  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="مدیریت پلن‌ها" subtitle="دسترسی محدود">
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
      title="مدیریت پلن‌ها"
      subtitle="تعریف پلن‌های فروش برق که در انتخاب پلن هنگام قرارداد نمایش داده می‌شوند"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "کل پلن‌ها", value: stats.total, tone: "text-slate-900" },
          { label: "فعال برای قرارداد", value: stats.active, tone: "text-emerald-600" },
          { label: "پیشنهادی", value: stats.recommended, tone: "text-brand-600" },
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
        <Button href="/dashboard/plans/new">+ پلن جدید</Button>
      </div>

      <Panel className="mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در نام، خلاصه یا نرخ..."
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:max-w-sm"
        />
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState
          title="پلنی در این فیلتر نیست"
          description="یک پلن جدید تعریف کنید یا فیلتر را تغییر دهید."
          action={<Button href="/dashboard/plans/new">افزودن پلن</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((plan) => {
            const isSeed = SEED_PLANS.some((s) => s.id === plan.id);
            const isOverridden = isSeed && plan.source === "custom";

            return (
              <article
                key={plan.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
                  plan.active ? "border-slate-200/70" : "border-slate-200/50 opacity-80",
                )}
              >
                {plan.recommended && (
                  <span className="absolute left-4 top-4 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    پیشنهادی
                  </span>
                )}
                <div className="mb-3 flex flex-wrap gap-2">
                  <StatusPill
                    label={plan.active ? "فعال در قرارداد" : "غیرفعال"}
                    tone={plan.active ? "success" : "muted"}
                  />
                  {isOverridden && <StatusPill label="ویرایش‌شده" tone="warning" />}
                  {!isSeed && <StatusPill label="ادمین" tone="brand" />}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{plan.tagline}</p>
                <div className="mt-4 space-y-1 text-sm">
                  <p className="font-bold text-slate-800">{plan.rate}</p>
                  <p className="text-slate-600">حجم: {plan.volume}</p>
                  <p className="text-emerald-700">{plan.savings}</p>
                </div>
                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="text-xs text-slate-600">
                      • {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePlanActive(plan.id, !plan.active)}
                  >
                    {plan.active ? "غیرفعال کردن" : "فعال کردن"}
                  </Button>
                  <Button href={`/dashboard/plans/${plan.id}/edit`} size="sm">
                    ویرایش
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(plan)}>
                    {isSeed ? "بازنشانی" : "حذف"}
                  </Button>
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
  tone: "success" | "warning" | "brand" | "muted";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    brand: "bg-brand-50 text-brand-700 ring-brand-100",
    muted: "bg-slate-50 text-slate-500 ring-slate-100",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", styles[tone])}>
      {label}
    </span>
  );
}
