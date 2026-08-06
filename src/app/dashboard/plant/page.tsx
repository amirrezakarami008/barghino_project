"use client";

import {
  DashboardPage,
  HealthScorePanel,
  MaintenanceAlertsPanel,
  Panel,
  PanelHeader,
  ProductionChart,
  StatusBadge,
} from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { MONTHLY_PRODUCTION } from "@/features/dashboard/constants";
import { useSolarPlants } from "@/features/dashboard/hooks/useSolarPlants";
import {
  getMaintenanceAlerts,
  getPlantHealth,
} from "@/features/dashboard/lib/assistant";
import { SITE_CONFIG } from "@/config";
import { cn } from "@/shared/lib/utils";
import type { SolarPlant } from "@/shared/types/dashboard";
import {
  Activity,
  ArrowUpRight,
  Cable,
  Gauge,
  MapPin,
  Plus,
  Receipt,
  ShieldAlert,
  Sun,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const RATE_PER_KWH = 15_000;

function formatMillion(n: number) {
  return (n / 1_000_000).toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}

function vsLabel(own: number, other: number) {
  const diff = ((own - other) / other) * 100;
  const abs = Math.abs(diff).toLocaleString("fa-IR", { maximumFractionDigits: 0 });
  if (diff >= 0) return `${abs}٪ بالاتر`;
  return `${abs}٪ پایین‌تر`;
}

export default function PlantPage() {
  const { plants } = useSolarPlants();
  const [selected, setSelected] = useState("");

  const activeId =
    plants.length === 0
      ? ""
      : plants.some((p) => p.id === selected)
        ? selected
        : plants[0]!.id;

  const plant = plants.find((p) => p.id === activeId);

  const compareInsight = useMemo(() => {
    const latest = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 1];
    if (!latest?.neighborProduction || !latest.nationalProduction) return null;
    return {
      month: latest.label,
      vsNeighbor: vsLabel(latest.production, latest.neighborProduction),
      vsNational: vsLabel(latest.production, latest.nationalProduction),
      aheadOfNeighbor: latest.production >= latest.neighborProduction,
      aheadOfNational: latest.production >= latest.nationalProduction,
    };
  }, []);

  if (!plant) {
    return (
      <DashboardPage title="نیروگاه من" subtitle="مدیریت و پایش نیروگاه‌های خورشیدی خانگی">
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-amber-200 bg-gradient-to-br from-amber-50 via-white to-brand-50/40 px-6 py-16 text-center">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-300/40">
              <Sun className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-extrabold text-slate-900">
              هنوز نیروگاهی ثبت نشده
            </h3>
            <p className="text-sm leading-7 text-slate-500">
              از مسیر نصب شروع کنید؛ بعد از راه‌اندازی، تولید، سلامت و مقایسه با اطراف اینجا دیده
              می‌شود.
            </p>
            <Button href="/dashboard/install" size="lg">
              درخواست نصب نیروگاه
            </Button>
          </div>
        </div>
      </DashboardPage>
    );
  }

  const monthlyEarnings = plant.monthlyProductionKwh * RATE_PER_KWH;
  const annualEarnings = monthlyEarnings * 12;
  const health = getPlantHealth(plant.id);
  const alerts = getMaintenanceAlerts().filter(
    (a) =>
      !a.plantName ||
      a.plantName === plant.name ||
      a.id.startsWith("a-prod") ||
      a.id === "a-review",
  );

  const metrics = [
    {
      id: "capacity",
      label: "ظرفیت نصب",
      value: plant.capacityKwp.toLocaleString("fa-IR"),
      unit: "kWp",
      hint: `${(plant.capacityKwp * 4).toLocaleString("fa-IR")} پنل تقریبی`,
      icon: Sun,
      accent: "from-amber-400 to-orange-500",
      soft: "bg-amber-50 text-amber-700",
    },
    {
      id: "production",
      label: "تولید ماه جاری",
      value: plant.monthlyProductionKwh.toLocaleString("fa-IR"),
      unit: "kWh",
      hint: "↑ ۱۲٪ نسبت به ماه قبل",
      icon: Zap,
      accent: "from-brand-500 to-emerald-500",
      soft: "bg-brand-50 text-brand-700",
    },
    {
      id: "earnings",
      label: "درآمد ماه جاری",
      value: formatMillion(monthlyEarnings),
      unit: "میلیون",
      hint: `${SITE_CONFIG.valueProps.barghinoPrice} تومان/kWh`,
      icon: Receipt,
      accent: "from-emerald-500 to-teal-500",
      soft: "bg-emerald-50 text-emerald-700",
    },
    {
      id: "annual",
      label: "برآورد سالانه",
      value: formatMillion(annualEarnings),
      unit: "میلیون",
      hint: "بر اساس نرخ نمونه فعلی",
      icon: TrendingUp,
      accent: "from-sky-500 to-brand-500",
      soft: "bg-sky-50 text-sky-700",
    },
  ];

  return (
    <DashboardPage
      title="نیروگاه من"
      subtitle="پایش تولید، سلامت و مقایسه با بام‌های اطراف"
      action={
        <Button href="/dashboard/install" variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          افزودن نیروگاه
        </Button>
      }
    >
      {/* Plant switcher */}
      {plants.length > 1 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {plants.map((p) => (
            <PlantChip
              key={p.id}
              plant={p}
              active={p.id === activeId}
              onSelect={() => setSelected(p.id)}
            />
          ))}
        </div>
      )}

      {/* Hero */}
      <section className="relative mb-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-l from-brand-50/80 via-white to-amber-50/50" />
          <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand-400/15 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        </div>

        <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.4fr_1fr] lg:p-7">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-300/35">
                <Sun className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    {plant.name}
                  </h2>
                  <StatusBadge status={plant.status} />
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {plant.address}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
              <MetaPill icon={Cable} label={`انشعاب ${plant.meterNumber}`} />
              <MetaPill icon={Activity} label={`راه‌اندازی ${plant.startDate}`} />
              <MetaPill icon={Gauge} label={`${plant.capacityKwp} kWp`} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button href="/dashboard/buy" size="sm">
                فروش برق
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
              <Button href="/dashboard/production" variant="outline" size="sm">
                گزارش تولید
              </Button>
              <Button href="/dashboard/support" variant="outline" size="sm">
                <ShieldAlert className="h-3.5 w-3.5" />
                گزارش خرابی
              </Button>
              <Button href="/dashboard/assistant" variant="ghost" size="sm">
                دستیار انرژی
              </Button>
            </div>
          </div>

          {/* Compact health / compare strip */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {health ? (
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 backdrop-blur-sm">
                <p className="text-xs font-medium text-slate-500">سلامت نیروگاه</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="font-display text-3xl font-black text-slate-900">
                    {health.score}
                    <span className="mr-1 text-sm font-bold text-slate-400">/۱۰۰</span>
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      health.level === "excellent" || health.level === "good"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700",
                    )}
                  >
                    {health.levelLabel}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  احتمال شستشو: {health.washRisk}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                <p className="text-xs text-slate-500">سلامت این نیروگاه به‌زودی محاسبه می‌شود.</p>
              </div>
            )}

            {compareInsight && (
              <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 backdrop-blur-sm">
                <p className="text-xs font-medium text-brand-700">مقایسه {compareInsight.month}</p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  نسبت به اطراف:{" "}
                  <span
                    className={
                      compareInsight.aheadOfNeighbor ? "text-emerald-600" : "text-amber-600"
                    }
                  >
                    {compareInsight.vsNeighbor}
                  </span>
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  نسبت به کشور:{" "}
                  <span
                    className={
                      compareInsight.aheadOfNational ? "text-emerald-600" : "text-amber-600"
                    }
                  >
                    {compareInsight.vsNational}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-1 bg-gradient-to-l opacity-90",
                  m.accent,
                )}
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">{m.label}</p>
                  <p className="mt-2 font-display text-2xl font-black tracking-tight text-slate-900">
                    {m.value}
                    <span className="mr-1 text-sm font-bold text-slate-400">{m.unit}</span>
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-400">{m.hint}</p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    m.soft,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main: chart + side panels */}
      <div className="mb-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Panel className="relative border-slate-200/80 overflow-visible">
          <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-brand-400/10 blur-3xl" />
          <PanelHeader
            title="روند تولید ۶ ماه اخیر"
            description="مقایسه نیروگاه شما با بام‌های اطراف و میانگین کشور"
            action={
              <Link
                href="/dashboard/production"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                گزارش کامل
              </Link>
            }
          />
          <div className="pt-2">
            <ProductionChart data={MONTHLY_PRODUCTION} compare />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <InsightChip
              color="brand"
              title="نیروگاه من"
              text="تولید واقعی پشت‌بام شما"
            />
            <InsightChip
              color="sky"
              title="بام‌های اطراف"
              text="میانگین نیروگاه‌های هم‌منطقه"
            />
            <InsightChip
              color="slate"
              title="میانگین کشور"
              text="میانگین پشت‌بام‌های خانگی"
            />
          </div>
        </Panel>

        <div className="space-y-5">
          {health && <HealthScorePanel health={health} compact />}
          <MaintenanceAlertsPanel alerts={alerts} limit={3} />
        </div>
      </div>

      {/* Specs + shortcuts */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelHeader title="مشخصات فنی" description="خلاصه پیکربندی نیروگاه انتخاب‌شده" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "ظرفیت نامی", value: `${plant.capacityKwp} kWp`, icon: Gauge },
              {
                label: "تعداد پنل (تخمینی)",
                value: `${plant.capacityKwp * 4} عدد`,
                icon: Sun,
              },
              { label: "نوع اتصال", value: "موازی با شبکه", icon: Cable },
              { label: "نوع اینورتر", value: "شبکه‌ای (Grid-tie)", icon: Zap },
              {
                label: "تولید سالانه تخمینی",
                value: `${(plant.monthlyProductionKwh * 12).toLocaleString("fa-IR")} kWh`,
                icon: Activity,
              },
              {
                label: "درآمد سالانه تخمینی",
                value: `${formatMillion(annualEarnings)} میلیون`,
                icon: Receipt,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-brand-100 hover:bg-brand-50/30"
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm ring-1 ring-slate-100">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{item.value}</p>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <h3 className="font-display text-lg font-bold">اقدامات سریع</h3>
          <p className="mt-1 text-sm text-slate-300">بدون برگشتن بین منوها</p>
          <div className="mt-5 space-y-2">
            {[
              { href: "/dashboard/buy", label: "شروع / مدیریت فروش برق", icon: Zap },
              { href: "/dashboard/invoices", label: "صورت‌حساب‌های فروش", icon: Receipt },
              { href: "/dashboard/assistant", label: "پرسش از دستیار انرژی", icon: Activity },
              { href: "/dashboard/support", label: "ثبت مشکل فنی", icon: Wrench },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-3 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/10"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-lime-300" />
                    {item.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>
    </DashboardPage>
  );
}

function PlantChip({
  plant,
  active,
  onSelect,
}: {
  plant: SolarPlant;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "shrink-0 rounded-2xl border-2 px-4 py-2.5 text-right transition",
        active
          ? "border-brand-500 bg-brand-50 shadow-sm shadow-brand-500/10"
          : "border-slate-200 bg-white hover:border-brand-200",
      )}
    >
      <p className={cn("text-sm font-bold", active ? "text-brand-800" : "text-slate-800")}>
        {plant.name}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">
        {plant.capacityKwp} kWp · {plant.monthlyProductionKwh.toLocaleString("fa-IR")} kWh
      </p>
    </button>
  );
}

function MetaPill({
  icon: Icon,
  label,
}: {
  icon: typeof MapPin;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 ring-1 ring-slate-200/80">
      <Icon className="h-3 w-3 text-slate-400" />
      {label}
    </span>
  );
}

function InsightChip({
  color,
  title,
  text,
}: {
  color: "brand" | "sky" | "slate";
  title: string;
  text: string;
}) {
  const styles = {
    brand: "border-brand-100 bg-brand-50/70 text-brand-800",
    sky: "border-sky-100 bg-sky-50/70 text-sky-800",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };
  const dots = {
    brand: "bg-brand-500",
    sky: "bg-sky-400",
    slate: "bg-slate-400",
  };

  return (
    <div className={cn("rounded-xl border px-3 py-2.5", styles[color])}>
      <p className="flex items-center gap-1.5 text-[11px] font-bold">
        <span className={cn("h-2 w-2 rounded-sm", dots[color])} />
        {title}
      </p>
      <p className="mt-1 text-[11px] opacity-80">{text}</p>
    </div>
  );
}
