"use client";

import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { ProductionAnalysis } from "@/features/dashboard/lib/production-analysis";
import {
  ArrowDownRight,
  ArrowUpRight,
  CloudSun,
  Droplets,
  Flame,
  Sparkles,
  Target,
  TrendingDown,
  Wrench,
} from "lucide-react";

const statusStyles = {
  good: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    bar: "from-emerald-500 to-brand-500",
    soft: "from-emerald-50/80 via-white to-brand-50/40",
  },
  ok: {
    badge: "bg-amber-50 text-amber-800 ring-amber-100",
    bar: "from-amber-400 to-brand-500",
    soft: "from-amber-50/70 via-white to-sky-50/40",
  },
  attention: {
    badge: "bg-rose-50 text-rose-700 ring-rose-100",
    bar: "from-rose-500 to-amber-400",
    soft: "from-rose-50/70 via-white to-amber-50/40",
  },
} as const;

const severityStyles = {
  high: "bg-rose-50 text-rose-700 ring-rose-100",
  medium: "bg-amber-50 text-amber-800 ring-amber-100",
  low: "bg-slate-100 text-slate-600 ring-slate-200/80",
} as const;

const factorIcon = {
  wash: Droplets,
  weather: CloudSun,
  health: Wrench,
  capacity: Target,
  shade: Flame,
  season: Sparkles,
} as const;

function gapTone(pct: number) {
  if (pct >= 0) return "text-emerald-700";
  if (pct > -8) return "text-amber-700";
  return "text-rose-700";
}

function gapLabel(pct: number) {
  const abs = Math.abs(pct).toLocaleString("fa-IR", { maximumFractionDigits: 1 });
  return pct >= 0 ? `${abs}٪ بالاتر` : `${abs}٪ پایین‌تر`;
}

interface ProductionAnalysisPanelProps {
  analysis: ProductionAnalysis;
  className?: string;
}

export function ProductionAnalysisPanel({ analysis, className }: ProductionAnalysisPanelProps) {
  const tone = statusStyles[analysis.status];
  const lostMillion = analysis.gaps.lostIncomeVsNeighbor / 1_000_000;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", tone.soft)} aria-hidden />
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-l", tone.bar)} aria-hidden />

      <div className="relative p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white shadow-md shadow-brand-500/25">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-500">تحلیل تولید · {analysis.periodLabel}</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                  tone.badge,
                )}
              >
                {analysis.statusLabel}
              </span>
            </div>

            <h2 className="font-display text-xl font-black leading-snug tracking-tight text-slate-900 sm:text-2xl">
              {analysis.headline}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">{analysis.summary}</p>
          </div>

          {analysis.gaps.lostKwhVsNeighbor > 0 ? (
            <div className="shrink-0 rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm ring-1 ring-rose-50 sm:min-w-[13.5rem]">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
                <TrendingDown className="h-3.5 w-3.5" />
                فرصت ازدست‌رفته
              </p>
              <p className="mt-2 font-display text-2xl font-black text-slate-900">
                {lostMillion.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
                <span className="mr-1 text-sm font-bold text-slate-500">میلیون</span>
              </p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                معادل {analysis.gaps.lostKwhVsNeighbor.toLocaleString("fa-IR")} kWh کمتر از اطراف
              </p>
            </div>
          ) : (
            <div className="shrink-0 rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm ring-1 ring-emerald-50 sm:min-w-[13.5rem]">
              <p className="text-[11px] font-bold text-emerald-700">بدون فاصله منفی</p>
              <p className="mt-2 font-display text-lg font-black text-slate-900">جلوتر از اطراف</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                در این بازه فرصت درآمد ازدست‌رفته‌ای دیده نشد
              </p>
            </div>
          )}
        </div>

        {/* Gaps */}
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <GapCard
            label="نسبت به بام‌های اطراف"
            value={gapLabel(analysis.gaps.vsNeighborPct)}
            tone={gapTone(analysis.gaps.vsNeighborPct)}
            positive={analysis.gaps.vsNeighborPct >= 0}
          />
          <GapCard
            label="نسبت به میانگین کشور"
            value={gapLabel(analysis.gaps.vsNationalPct)}
            tone={gapTone(analysis.gaps.vsNationalPct)}
            positive={analysis.gaps.vsNationalPct >= 0}
          />
          <GapCard
            label="نسبت به ظرفیت مورد انتظار"
            value={gapLabel(analysis.gaps.vsExpectedPct)}
            tone={gapTone(analysis.gaps.vsExpectedPct)}
            positive={analysis.gaps.vsExpectedPct >= 0}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          {/* Factors */}
          <div>
            <p className="mb-3 text-xs font-bold text-slate-500">عوامل اثرگذار</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {analysis.factors.map((factor) => {
                const Icon =
                  factorIcon[factor.id as keyof typeof factorIcon] ?? Sparkles;
                return (
                  <div
                    key={factor.id}
                    className="rounded-2xl border border-slate-200/90 bg-white/90 p-3.5 shadow-sm"
                  >
                    <div className="mb-2.5 flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-100">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold ring-1",
                          severityStyles[factor.severity],
                        )}
                      >
                        {factor.severity === "high"
                          ? "بالا"
                          : factor.severity === "medium"
                            ? "متوسط"
                            : "کم"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{factor.title}</p>
                    <p className="mt-1 text-[11px] font-semibold text-brand-700">{factor.impactLabel}</p>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{factor.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Highlights + action */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <p className="text-[10px] font-bold text-emerald-700">بهترین بازه</p>
                <p className="mt-1 text-sm font-black text-slate-900">{analysis.highlights.best.label}</p>
                <p className="mt-0.5 text-[11px] font-bold text-emerald-700">
                  {analysis.highlights.best.production.toLocaleString("fa-IR")} kWh
                </p>
                <p className="mt-1 text-[10px] text-slate-500">{analysis.highlights.best.note}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5">
                <p className="text-[10px] font-bold text-amber-700">ضعیف‌ترین بازه</p>
                <p className="mt-1 text-sm font-black text-slate-900">{analysis.highlights.worst.label}</p>
                <p className="mt-0.5 text-[11px] font-bold text-amber-700">
                  {analysis.highlights.worst.production.toLocaleString("fa-IR")} kWh
                </p>
                <p className="mt-1 text-[10px] text-slate-500">{analysis.highlights.worst.note}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-gradient-to-l from-brand-50/90 to-white p-4 ring-1 ring-brand-50">
              <p className="text-sm font-bold text-slate-900">{analysis.action.title}</p>
              <p className="mt-1 text-[12px] leading-6 text-slate-500">{analysis.action.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button href={analysis.action.primaryHref} size="sm">
                  {analysis.action.primaryLabel}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
                <Button href={analysis.action.secondaryHref} variant="outline" size="sm">
                  {analysis.action.secondaryLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GapCard({
  label,
  value,
  tone,
  positive,
}: {
  label: string;
  value: string;
  tone: string;
  positive: boolean;
}) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-3.5 shadow-sm">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className={cn("mt-2 flex items-center gap-1 font-display text-lg font-black", tone)}>
        <Icon className="h-4 w-4" />
        {value}
      </p>
    </div>
  );
}
