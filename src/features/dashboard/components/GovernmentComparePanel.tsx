import { Panel } from "./Panel";
import { SITE_CONFIG } from "@/config";
import { MONTHLY_PRODUCTION } from "@/features/dashboard/constants";
import { parsePersianNumber } from "@/shared/lib/numbers";
import { ArrowLeftRight, Building2, Sparkles, Sun, TrendingUp, Zap } from "lucide-react";

function toMillionNumber(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return (safe / 1_000_000).toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}

/** مقایسه درآمد واقعی تولید با نرخ پایه vs برقینو */
export function GovernmentComparePanel({
  productionKwh,
  periodLabel = "۶ ماه اخیر",
}: {
  productionKwh?: number;
  periodLabel?: string;
}) {
  const { valueProps } = SITE_CONFIG;
  const govRate = parsePersianNumber(valueProps.governmentPrice);
  const barghinoRate = parsePersianNumber(valueProps.barghinoPrice);

  const kwh =
    productionKwh ?? MONTHLY_PRODUCTION.reduce((acc, p) => acc + p.production, 0);

  const govIncome = kwh * govRate;
  const barghinoIncome = kwh * barghinoRate;
  const diff = barghinoIncome - govIncome;
  const multiplier =
    govRate > 0 ? (barghinoRate / govRate).toLocaleString("fa-IR", { maximumFractionDigits: 1 }) : "—";

  return (
    <Panel
      padding="none"
      className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-slate-50/40 to-brand-50/30"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-brand-300/50 to-transparent" />
      </div>

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200/80">
              <ArrowLeftRight className="h-3 w-3" />
              مقایسه مسیر فروش
            </div>
            <h2 className="font-display text-lg font-extrabold leading-snug tracking-tight text-slate-900 sm:text-xl">
              اگر با نرخ پایه می‌فروختی چقدر از دست می‌دادی؟
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              بر اساس تولید {periodLabel}
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="font-semibold text-slate-700">
                {kwh.toLocaleString("fa-IR")} kWh
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-white/80 px-3 py-2 text-center shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm">
            <p className="text-[10px] font-medium text-slate-400">نسبت نرخ نمونه</p>
            <p className="font-display text-lg font-black text-brand-700">≈{multiplier}×</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
          {/* Government */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-slate-300 to-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">فروش پایه</p>
                <p className="text-[10px] text-slate-400">نرخ ثابت اول سال</p>
              </div>
            </div>
            <p className="mt-4 font-display text-2xl font-black tracking-tight text-slate-600 sm:text-[1.65rem]">
              {toMillionNumber(govIncome)}
              <span className="mr-1 text-sm font-bold text-slate-400">میلیون</span>
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">نرخ هر kWh</span>
              <span className="rounded-lg bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                {valueProps.governmentPrice}
              </span>
            </div>
          </div>

          {/* Barghino */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-brand-200/80 bg-gradient-to-b from-brand-50/90 to-white p-4 shadow-sm shadow-brand-500/5 transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-emerald-400 to-brand-500" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/30">
                <Sun className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-800">فروش به برقینو</p>
                <p className="text-[10px] text-brand-600/80">نرخ فصلی بورس سبز</p>
              </div>
            </div>
            <p className="mt-4 font-display text-2xl font-black tracking-tight text-brand-700 sm:text-[1.65rem]">
              {toMillionNumber(barghinoIncome)}
              <span className="mr-1 text-sm font-bold text-brand-500">میلیون</span>
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-brand-100 pt-3">
              <span className="text-[11px] text-brand-600/70">نرخ هر kWh</span>
              <span className="rounded-lg bg-brand-500/10 px-2 py-0.5 text-xs font-bold text-brand-700 ring-1 ring-brand-200/60">
                {valueProps.barghinoPrice}
              </span>
            </div>
          </div>

          {/* Savings */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-500 p-4 text-white shadow-xl shadow-brand-600/20 sm:col-span-2 lg:col-span-1">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute -left-8 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
            </div>

            <div className="relative flex flex-1 flex-col">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4" strokeWidth={2.25} />
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20">
                  <Sparkles className="h-3 w-3 text-lime-200" />
                  سود بیشتر با برقینو
                </div>
              </div>

              <p className="mt-4 font-display text-2xl font-black tracking-tight sm:text-[1.65rem]">
                <span className="text-lime-200">+</span>
                {toMillionNumber(diff)}
                <span className="mr-1 text-sm font-bold text-white/70">میلیون</span>
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/80">تومان در همین بازه</p>

              <div className="mt-auto rounded-xl bg-black/15 px-3 py-2.5 text-[10px] leading-5 text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-lime-200">
                  <Zap className="h-3 w-3" />
                  مزیت فصلی
                </div>
                نرخ پایه اول سال ثابت است؛ برقینو در فصل گرم گران‌تر می‌خرد و در فصل سرد کف{" "}
                {valueProps.coldSeasonPremiumPercent}٪ بالاتر از پایه دارد.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
