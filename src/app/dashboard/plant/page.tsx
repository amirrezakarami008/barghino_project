"use client";

import {
  DashboardPage,
  HealthScorePanel,
  MaintenanceAlertsPanel,
  Panel,
  PanelHeader,
  ProductionChart,
  StatCard,
  StatusBadge,
} from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { MONTHLY_PRODUCTION, SOLAR_PLANTS } from "@/features/dashboard/constants";
import {
  getMaintenanceAlerts,
  getPlantHealth,
} from "@/features/dashboard/lib/assistant";
import { Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const RATE_PER_KWH = 15_000;

function formatMillion(n: number) {
  return `${(n / 1_000_000).toFixed(1)} M`;
}

export default function PlantPage() {
  const [selected, setSelected] = useState(SOLAR_PLANTS[0]?.id ?? "");
  const plant = SOLAR_PLANTS.find((p) => p.id === selected) ?? SOLAR_PLANTS[0];

  if (!plant) {
    return (
      <DashboardPage title="نیروگاه من" subtitle="مدیریت نیروگاه‌های خورشیدی خانگی">
        <Panel className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
            <Sun className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">هنوز نیروگاهی ثبت نشده</h3>
          <p className="max-w-sm text-sm text-slate-500">
            برقینو نیروگاه خورشیدی را روی پشت‌بام خانه‌تان نصب می‌کند. همین الان درخواست دهید.
          </p>
          <Button href="/dashboard/install" size="lg">
            درخواست نصب نیروگاه
          </Button>
        </Panel>
      </DashboardPage>
    );
  }

  const monthlyEarnings = plant.monthlyProductionKwh * RATE_PER_KWH;
  const annualEarnings = monthlyEarnings * 12;
  const health = getPlantHealth(plant.id);
  const alerts = getMaintenanceAlerts().filter(
    (a) => !a.plantName || a.plantName === plant.name || a.id.startsWith("a-prod") || a.id === "a-review",
  );

  const stats = [
    {
      id: "capacity",
      label: "ظرفیت نصب‌شده",
      value: String(plant.capacityKwp),
      suffix: "kWp",
      trend: "neutral" as const,
      icon: "Sun" as const,
      color: "amber" as const,
    },
    {
      id: "production",
      label: "تولید ماه جاری",
      value: String(plant.monthlyProductionKwh),
      suffix: "kWh",
      change: "↑ ۱۲٪ نسبت به ماه قبل",
      trend: "up" as const,
      icon: "BarChart3" as const,
      color: "blue" as const,
    },
    {
      id: "earnings",
      label: "درآمد ماه جاری",
      value: formatMillion(monthlyEarnings),
      suffix: "میلیون تومان",
      change: "نرخ ۱۵٬۰۰۰ تومان/kWh",
      trend: "up" as const,
      icon: "Receipt" as const,
      color: "green" as const,
    },
    {
      id: "annual",
      label: "درآمد تخمینی سالانه",
      value: formatMillion(annualEarnings),
      suffix: "میلیون تومان",
      trend: "up" as const,
      icon: "BarChart3" as const,
      color: "violet" as const,
    },
  ];

  return (
    <DashboardPage title="نیروگاه من" subtitle="مدیریت و پایش نیروگاه‌های خورشیدی خانگی">
      {/* انتخاب نیروگاه */}
      {SOLAR_PLANTS.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {SOLAR_PLANTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${
                p.id === selected
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
              }`}
            >
              {p.name}
            </button>
          ))}
          <Button href="/dashboard/install" variant="outline" size="sm">
            + افزودن نیروگاه
          </Button>
        </div>
      )}

      {/* اطلاعات نیروگاه انتخاب‌شده */}
      <Panel className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300/30">
              <Sun className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{plant.name}</h2>
                <StatusBadge status={plant.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{plant.address}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                شماره انشعاب: {plant.meterNumber} · راه‌اندازی: {plant.startDate}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button href="/dashboard/contracts" variant="outline" size="sm">
              قرارداد فروش
            </Button>
            <Button href="/dashboard/support" variant="outline" size="sm">
              گزارش خرابی
            </Button>
          </div>
        </div>
      </Panel>

      {/* کارت‌های آماری */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      {health && (
        <div className="mb-6">
          <HealthScorePanel health={health} />
        </div>
      )}

      <div className="mb-6">
        <MaintenanceAlertsPanel alerts={alerts} limit={4} />
      </div>

      {/* نمودار تولید */}
      <Panel className="mb-6">
        <PanelHeader
          title="روند تولید ۶ ماه اخیر"
          action={
            <Link href="/dashboard/production" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              گزارش کامل
            </Link>
          }
        />
        <ProductionChart data={MONTHLY_PRODUCTION} showEarnings />
      </Panel>

      {/* اطلاعات فنی */}
      <Panel>
        <PanelHeader title="مشخصات فنی" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "ظرفیت نامی", value: `${plant.capacityKwp} kWp` },
            { label: "تعداد پنل (تخمینی)", value: `${plant.capacityKwp * 4} عدد` },
            { label: "نوع اتصال", value: "موازی با شبکه" },
            { label: "نوع اینورتر", value: "شبکه‌ای (Grid-tie)" },
            { label: "تولید سالانه تخمینی", value: `${(plant.monthlyProductionKwh * 12).toLocaleString("fa-IR")} kWh` },
            { label: "درآمد سالانه تخمینی", value: `${formatMillion(annualEarnings)} میلیون` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}
