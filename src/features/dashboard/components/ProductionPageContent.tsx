"use client";

import {
  DashboardPage,
  Panel,
  PanelHeader,
  ProductionChart,
  StatusBadge,
} from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import {
  MONTHLY_PRODUCTION,
  SELL_INVOICES,
  SOLAR_PLANTS,
} from "@/features/dashboard/constants";
import {
  getPeriodMeta,
  getProductionSeries,
  PRODUCTION_PERIODS,
  type ProductionPeriod,
} from "@/features/dashboard/constants/production-series";
import {
  formatMillionToman,
  getIncomeForecast,
} from "@/features/dashboard/lib/insights";
import { getProductionAnalysis } from "@/features/dashboard/lib/production-analysis";
import { ProductionAnalysisPanel } from "@/features/dashboard/components/ProductionAnalysisPanel";
import { SITE_CONFIG } from "@/config";
import { cn } from "@/shared/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CloudSun,
  Flame,
  MapPin,
  Receipt,
  Sparkles,
  Sun,
  TrendingUp,
  Wallet,
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

function pctDiff(own: number, other: number) {
  if (!other) return 0;
  return ((own - other) / other) * 100;
}

function pctLabel(diff: number) {
  const abs = Math.abs(diff).toLocaleString("fa-IR", { maximumFractionDigits: 0 });
  return diff >= 0 ? `${abs}٪ بالاتر` : `${abs}٪ پایین‌تر`;
}

export function ProductionPageContent() {
  const [period, setPeriod] = useState<ProductionPeriod>("monthly");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const series = useMemo(() => getProductionSeries(period), [period]);
  const periodMeta = getPeriodMeta(period);

  function changePeriod(next: ProductionPeriod) {
    setPeriod(next);
    setSelectedIndex(Math.max(0, getProductionSeries(next).length - 1));
  }

  const forecast = getIncomeForecast();
  const latestMonth = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 1]!;
  const previousMonth = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 2]!;
  const selected = series[selectedIndex] ?? series[series.length - 1]!;

  const totalProduction = MONTHLY_PRODUCTION.reduce((a, p) => a + p.production, 0);
  const totalEarnings = MONTHLY_PRODUCTION.reduce((a, p) => a + p.earnings, 0);
  const changePercent =
    previousMonth.production > 0
      ? ((latestMonth.production - previousMonth.production) / previousMonth.production) * 100
      : 0;
  const isUp = changePercent >= 0;

  const vsNeighbor = pctDiff(selected.production, selected.neighborProduction ?? 0);
  const vsNational = pctDiff(selected.production, selected.nationalProduction ?? 0);
  const govIncome = selected.production * 5_000;
  const barghinoExtra = selected.earnings - govIncome;

  const bestMonth = useMemo(
    () =>
      MONTHLY_PRODUCTION.reduce((best, m) =>
        m.production > best.production ? m : best,
      ),
    [],
  );

  const seriesHighlights = useMemo(() => {
    if (!series.length) return { best: null, worst: null, total: 0, avg: 0 };
    const best = series.reduce((b, p) => (p.production > b.production ? p : b));
    const worst = series.reduce((w, p) => (p.production < w.production ? p : w));
    const total = series.reduce((a, p) => a + p.production, 0);
    return { best, worst, total, avg: total / series.length };
  }, [series]);

  const analysis = useMemo(() => getProductionAnalysis(period, series), [period, series]);

  const plantTotalKwh = SOLAR_PLANTS.reduce((a, p) => a + p.monthlyProductionKwh, 0);

  const timelineItems =
    period === "daily"
      ? series.filter((_, i) => i % 5 === 0 || i === series.length - 1)
      : series;

  return (
    <DashboardPage
      title="تولید و درآمد"
      subtitle="مرکز تحلیل تولید، مقایسه منطقه‌ای و درآمد فروش به برقینو"
      action={
        <div className="flex flex-wrap gap-2">
          <Button href="/dashboard/plant" variant="outline" size="sm">
            نیروگاه من
          </Button>
          <Button href="/dashboard/invoices" size="sm">
            صورت‌حساب‌ها
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      }
    >
      {/* Hero */}
      <section className="relative mb-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-l from-emerald-50/50 via-white to-brand-50/40" />
          <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-brand-500 via-emerald-400 to-amber-300" />
        </div>

        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white shadow-md shadow-brand-500/25">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-brand-700 shadow-sm ring-1 ring-brand-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  گزارش زنده · {latestMonth.label} ۱۴۰۴
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                    isUp
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : "bg-amber-50 text-amber-700 ring-amber-100",
                  )}
                >
                  {isUp ? "↑" : "↓"}{" "}
                  {Math.abs(changePercent).toLocaleString("fa-IR", {
                    maximumFractionDigits: 1,
                  })}
                  ٪ نسبت به {previousMonth.label}
                </span>
              </div>

              <h2 className="font-display text-2xl font-black leading-snug tracking-tight text-slate-900 sm:text-3xl">
                این ماه{" "}
                <span className="bg-gradient-to-l from-brand-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatMillion(latestMonth.earnings)} میلیون تومان
                </span>{" "}
                درآمد داشتی
              </h2>
              <p className="mt-2.5 max-w-xl text-sm leading-7 text-slate-500">
                از فروش{" "}
                <span className="font-semibold text-slate-700">
                  {latestMonth.production.toLocaleString("fa-IR")} kWh
                </span>{" "}
                با نرخ نمونه {SITE_CONFIG.valueProps.barghinoPrice}{" "}
                {SITE_CONFIG.valueProps.priceUnit} — مقایسه با اطراف و کشور در چارت پایین.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
              <Button href="/dashboard/invoices" size="sm">
                صورت‌حساب‌ها
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
              <Button href="/dashboard/plant" variant="outline" size="sm">
                نیروگاه من
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <HeroStat
              icon={Zap}
              label="تولید ماه جاری"
              value={latestMonth.production.toLocaleString("fa-IR")}
              unit="kWh"
              accent="from-brand-500 to-emerald-400"
              soft="bg-brand-50 text-brand-700"
            />
            <HeroStat
              icon={Wallet}
              label="درآمد ماه جاری"
              value={formatMillion(latestMonth.earnings)}
              unit="میلیون"
              accent="from-emerald-500 to-teal-400"
              soft="bg-emerald-50 text-emerald-700"
              featured
            />
            <HeroStat
              icon={BarChart3}
              label="تولید ۶ ماه"
              value={totalProduction.toLocaleString("fa-IR")}
              unit="kWh"
              accent="from-sky-500 to-brand-400"
              soft="bg-sky-50 text-sky-700"
            />
            <HeroStat
              icon={Banknote}
              label="درآمد ۶ ماه"
              value={formatMillion(totalEarnings)}
              unit="میلیون"
              accent="from-amber-400 to-orange-400"
              soft="bg-amber-50 text-amber-700"
            />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-emerald-400 to-brand-500" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">سود بیشتر نسبت به پایه</p>
                  </div>
                  <p className="mt-3 font-display text-3xl font-black tracking-tight text-emerald-700">
                    +{formatMillion(barghinoExtra)}
                    <span className="mr-1 text-sm font-bold text-emerald-500">میلیون</span>
                  </p>
                  <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                    فروش پایه همین تولید ≈ {formatMillion(govIncome)} میلیون بود.
                  </p>
                </div>
                <span className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-center text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                  ≈۳×
                  <span className="mt-0.5 block font-medium text-emerald-600/80">نرخ نمونه</span>
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-amber-400 to-orange-400" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                      <Flame className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">بهترین ماه دوره</p>
                  </div>
                  <p className="mt-3 font-display text-2xl font-black tracking-tight text-slate-900">
                    {bestMonth.label}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {bestMonth.production.toLocaleString("fa-IR")} kWh ·{" "}
                    <span className="font-bold text-emerald-700">
                      {formatMillion(bestMonth.earnings)} میلیون
                    </span>
                  </p>
                </div>
                <span className="rounded-xl bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-800 ring-1 ring-amber-100">
                  اوج تولید
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forecast strip */}
      <section className="mb-5 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/60 p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <CloudSun className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">پیش‌بینی درآمد</p>
                <p className="text-[11px] text-slate-500">
                  اطمینان {forecast.confidence.toLocaleString("fa-IR")}٪ · آب‌وهوا لحاظ شده
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/reports"
              className="text-xs font-medium text-brand-700 hover:text-brand-800"
            >
              گزارش ماهانه
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <ForecastMini
              label={forecast.nextWeek.label}
              income={formatMillionToman(forecast.nextWeek.income)}
              prod={forecast.nextWeek.productionKwh}
            />
            <ForecastMini
              label={forecast.nextMonth.label}
              income={formatMillionToman(forecast.nextMonth.income)}
              prod={forecast.nextMonth.productionKwh}
              accent
            />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">سناریوی رشد نرخ</p>
          <p className="mt-2 font-display text-xl font-black text-emerald-900">
            اگر نرخ {forecast.rateUpScenario.rateChangePercent}٪ بالا برود
          </p>
          <p className="mt-2 text-sm text-emerald-800">
            درآمد ماه آینده حدود{" "}
            <span className="font-bold">
              {formatMillionToman(forecast.rateUpScenario.income)}
            </span>
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-600">
            +{formatMillionToman(forecast.rateUpScenario.extra)} سود اضافه
          </p>
        </div>

        <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
          <p className="text-xs font-medium text-brand-700">نرخ فعلی نمونه</p>
          <p className="mt-2 font-display text-2xl font-black text-brand-800">
            {SITE_CONFIG.valueProps.barghinoPrice}
          </p>
          <p className="mt-1 text-xs text-brand-600/80">{SITE_CONFIG.valueProps.priceUnit}</p>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            فصل گرم قیمت بالاتر · فصل سرد کف{" "}
            {SITE_CONFIG.valueProps.coldSeasonPremiumPercent}٪ بالاتر از پایه
          </p>
        </div>
      </section>

      {/* Chart + period detail */}
      <div className="mb-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Panel className="relative overflow-visible border-slate-200/80">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">{periodMeta.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{periodMeta.description}</p>
            </div>
            <PeriodSwitcher period={period} onChange={changePeriod} />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              {periodMeta.unitHint}
            </span>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-brand-100">
              میانگین بازه: {seriesHighlights.avg.toLocaleString("fa-IR", { maximumFractionDigits: 0 })}{" "}
              kWh
            </span>
            {seriesHighlights.best && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                اوج: {seriesHighlights.best.label}
              </span>
            )}
          </div>

          <ProductionChart
            data={series}
            compare
            density={period === "daily" ? "compact" : "comfortable"}
            activeIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            fullscreenTitle={periodMeta.title}
            fullscreenDescription={periodMeta.description}
            fullscreenToolbar={<PeriodSwitcher period={period} onChange={changePeriod} />}
          />
        </Panel>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-emerald-400 via-brand-500 to-sky-400" />
            <p className="text-xs font-medium text-slate-500">{periodMeta.detailTitle}</p>
            <h3 className="mt-1 font-display text-xl font-extrabold text-slate-900">
              {selected.label}
            </h3>

            <div className="mt-4 space-y-3">
              <CompareRow
                tone="own"
                label="نیروگاه من"
                value={`${selected.production.toLocaleString("fa-IR")} kWh`}
              />
              <CompareRow
                tone="neighbor"
                label="بام‌های اطراف"
                value={`${(selected.neighborProduction ?? 0).toLocaleString("fa-IR")} kWh`}
                delta={pctLabel(vsNeighbor)}
                positive={vsNeighbor >= 0}
              />
              <CompareRow
                tone="national"
                label="میانگین کشور"
                value={`${(selected.nationalProduction ?? 0).toLocaleString("fa-IR")} kWh`}
                delta={pctLabel(vsNational)}
                positive={vsNational >= 0}
              />
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">{periodMeta.incomeLabel}</span>
                <span className="font-display text-lg font-black text-emerald-700">
                  {formatMillion(selected.earnings)} میلیون
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                با نرخ نمونه {SITE_CONFIG.valueProps.barghinoPrice} تومان/kWh
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MiniMetric
              icon={Zap}
              label="تولید شما"
              value={selected.production.toLocaleString("fa-IR")}
              unit="kWh"
              soft="bg-brand-50 text-brand-700"
            />
            <MiniMetric
              icon={Wallet}
              label="درآمد شما"
              value={formatMillion(selected.earnings)}
              unit="M"
              soft="bg-emerald-50 text-emerald-700"
            />
          </div>

          {period === "daily" && seriesHighlights.best && seriesHighlights.worst && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setSelectedIndex(series.findIndex((p) => p.label === seriesHighlights.best!.label))
                }
                className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-right transition hover:border-emerald-200"
              >
                <p className="text-[10px] font-bold text-emerald-700">بهترین روز</p>
                <p className="mt-1 text-sm font-black text-slate-900">{seriesHighlights.best.label}</p>
                <p className="mt-0.5 text-[11px] text-emerald-700">
                  {seriesHighlights.best.production.toLocaleString("fa-IR")} kWh
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedIndex(series.findIndex((p) => p.label === seriesHighlights.worst!.label))
                }
                className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 text-right transition hover:border-amber-200"
              >
                <p className="text-[10px] font-bold text-amber-700">ضعیف‌ترین روز</p>
                <p className="mt-1 text-sm font-black text-slate-900">{seriesHighlights.worst.label}</p>
                <p className="mt-0.5 text-[11px] text-amber-700">
                  {seriesHighlights.worst.production.toLocaleString("fa-IR")} kWh
                </p>
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductionAnalysisPanel analysis={analysis} className="mb-5" />

      {/* Timeline */}
      <Panel className="mb-5">
        <PanelHeader
          title={periodMeta.timelineTitle}
          description={periodMeta.timelineDescription}
        />
        <div
          className={cn(
            "grid gap-3",
            period === "daily"
              ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
              : period === "weekly"
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
          )}
        >
          {timelineItems.map((m) => {
            const fullIndex = series.findIndex((p) => p.label === m.label);
            const active = fullIndex === selectedIndex;
            const nDiff = pctDiff(m.production, m.neighborProduction ?? 0);
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => setSelectedIndex(fullIndex)}
                className={cn(
                  "rounded-2xl border p-3.5 text-right transition",
                  active
                    ? "border-brand-400 bg-brand-50/80 shadow-md shadow-brand-500/10 ring-1 ring-brand-200"
                    : "border-slate-200 bg-white hover:border-brand-200 hover:shadow-sm",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{m.label}</p>
                  {active && (
                    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[9px] font-bold text-white">
                      فعال
                    </span>
                  )}
                </div>
                <p className="mt-3 font-display text-xl font-black text-brand-700">
                  {m.production.toLocaleString("fa-IR")}
                </p>
                <p className="text-[10px] text-slate-400">kWh · نیروگاه من</p>
                <div className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-[10px]">
                  <p className="flex justify-between text-sky-700">
                    <span>اطراف</span>
                    <span className="font-bold">
                      {(m.neighborProduction ?? 0).toLocaleString("fa-IR")}
                    </span>
                  </p>
                  <p className="flex justify-between text-slate-500">
                    <span>کشور</span>
                    <span className="font-bold">
                      {(m.nationalProduction ?? 0).toLocaleString("fa-IR")}
                    </span>
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-2 text-[10px] font-bold",
                    nDiff >= 0 ? "text-emerald-600" : "text-amber-600",
                  )}
                >
                  {nDiff >= 0 ? (
                    <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="ml-0.5 inline h-3 w-3" />
                  )}
                  {pctLabel(nDiff)} از اطراف
                </p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                  {formatMillion(m.earnings)} میلیون درآمد
                </p>
              </button>
            );
          })}
        </div>
        {period === "daily" && (
          <p className="mt-3 text-center text-[11px] text-slate-400">
            برای شلوغ نشدن، نمونه‌ای از روزها نشان داده شده — همه ۳۰ روز در چارت بالا قابل انتخاب‌اند.
          </p>
        )}
      </Panel>

      {/* Plants + invoices */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="سهم نیروگاه‌ها از تولید ماه"
            action={
              <Button href="/dashboard/plant" variant="ghost" size="sm">
                مدیریت
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <div className="space-y-3">
            {SOLAR_PLANTS.map((plant) => {
              const earnings = plant.monthlyProductionKwh * RATE_PER_KWH;
              const share =
                plantTotalKwh > 0
                  ? Math.round((plant.monthlyProductionKwh / plantTotalKwh) * 100)
                  : 0;
              const efficiency = Math.round(
                (plant.monthlyProductionKwh / (plant.capacityKwp * 150)) * 100,
              );

              return (
                <div
                  key={plant.id}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-l from-slate-50/80 to-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                        <Sun className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{plant.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {plant.capacityKwp} kWp · {plant.address}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-brand-100">
                      سهم {share.toLocaleString("fa-IR")}٪
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-brand-500 to-emerald-400"
                      style={{ width: `${share}%` }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-amber-50/80 px-2 py-2">
                      <p className="text-[10px] text-amber-700/80">تولید</p>
                      <p className="text-sm font-bold text-amber-800">
                        {plant.monthlyProductionKwh.toLocaleString("fa-IR")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50/80 px-2 py-2">
                      <p className="text-[10px] text-emerald-700/80">درآمد</p>
                      <p className="text-sm font-bold text-emerald-800">
                        {formatMillion(earnings)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-brand-50/80 px-2 py-2">
                      <p className="text-[10px] text-brand-700/80">بازدهی</p>
                      <p className="text-sm font-bold text-brand-800">
                        {efficiency.toLocaleString("fa-IR")}٪
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="آخرین صورت‌حساب‌های فروش"
            action={
              <Button href="/dashboard/invoices" variant="ghost" size="sm">
                همه
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <div className="space-y-3">
            {SELL_INVOICES.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{inv.plantName}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {inv.period} · {inv.energyKwh} kWh × {inv.ratePerKwh}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                  <p className="font-display text-base font-black text-slate-900">
                    {inv.amount}
                  </p>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <Banknote className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-slate-800">میانبر مالی</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/dashboard/payments"
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-800"
              >
                پرداخت‌ها
              </Link>
              <Link
                href="/dashboard/buy"
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-800"
              >
                فروش برق
              </Link>
            </div>
          </div>
        </Panel>
      </div>

      {/* Bottom insight */}
      <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-200 bg-gradient-to-l from-brand-50 via-white to-emerald-50/60 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">جزئیات بیشتر می‌خوای؟</p>
            <p className="mt-1 text-sm text-slate-500">
              گزارش ماهانه هوشمند و دستیار انرژی، جزئیات نگهداری و روند بلندمدت را باز می‌کنند.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/dashboard/reports" variant="outline" size="sm">
            گزارش ماهانه
          </Button>
          <Button href="/dashboard/assistant" size="sm">
            دستیار انرژی
          </Button>
        </div>
      </div>
    </DashboardPage>
  );
}

function PeriodSwitcher({
  period,
  onChange,
}: {
  period: ProductionPeriod;
  onChange: (period: ProductionPeriod) => void;
}) {
  return (
    <div
      className="inline-flex rounded-2xl border border-slate-200 bg-slate-100/80 p-1 shadow-inner"
      role="tablist"
      aria-label="بازه زمانی گزارش"
    >
      {PRODUCTION_PERIODS.map((item) => {
        const active = item.id === period;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative min-w-[4.75rem] rounded-xl px-3 py-2 text-center transition",
              active
                ? "bg-white text-brand-800 shadow-sm ring-1 ring-brand-100"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <span className="block text-xs font-bold">{item.label}</span>
            <span
              className={cn(
                "mt-0.5 block text-[9px] font-medium",
                active ? "text-brand-600/80" : "text-slate-400",
              )}
            >
              {item.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  unit,
  accent,
  soft,
  featured,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  unit: string;
  accent: string;
  soft: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md",
        featured ? "border-emerald-200/90" : "border-slate-200/90",
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-l", accent)} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-black tracking-tight text-slate-900">
            {value}
            <span className="mr-1 text-sm font-bold text-slate-400">{unit}</span>
          </p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", soft)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ForecastMini({
  label,
  income,
  prod,
  accent,
}: {
  label: string;
  income: string;
  prod: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2.5 ring-1",
        accent
          ? "bg-brand-50 ring-brand-100"
          : "bg-white/80 ring-amber-100",
      )}
    >
      <p className={cn("text-[10px]", accent ? "text-brand-600" : "text-slate-500")}>
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-base font-black",
          accent ? "text-brand-800" : "text-slate-900",
        )}
      >
        {income}
      </p>
      <p className="mt-0.5 text-[10px] text-slate-400">
        ≈ {prod.toLocaleString("fa-IR")} kWh
      </p>
    </div>
  );
}

function CompareRow({
  tone,
  label,
  value,
  delta,
  positive,
}: {
  tone: "own" | "neighbor" | "national";
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  const dots = {
    own: "bg-brand-500",
    neighbor: "bg-sky-400",
    national: "bg-slate-400",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-xs text-slate-600">
        <span className={cn("h-2.5 w-2.5 rounded-sm", dots[tone])} />
        {label}
      </span>
      <div className="text-left">
        <p className="text-sm font-bold text-slate-900">{value}</p>
        {delta && (
          <p
            className={cn(
              "text-[10px] font-semibold",
              positive ? "text-emerald-600" : "text-amber-600",
            )}
          >
            شما {delta}
          </p>
        )}
      </div>
    </div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
  unit,
  soft,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  unit: string;
  soft: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className={cn("mb-2 flex h-8 w-8 items-center justify-center rounded-lg", soft)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="mt-1 font-display text-lg font-black text-slate-900">
        {value}
        <span className="mr-1 text-[10px] font-bold text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
