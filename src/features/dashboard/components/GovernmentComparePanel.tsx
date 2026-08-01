import { Panel, PanelHeader } from "./Panel";
import { SITE_CONFIG } from "@/config";
import { MONTHLY_PRODUCTION } from "@/features/dashboard/constants";
import { parsePersianNumber } from "@/shared/lib/numbers";

function formatToman(n: number) {
  return n.toLocaleString("fa-IR");
}

function toMillionLabel(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return `${(safe / 1_000_000).toFixed(1)} میلیون`;
}

/** مقایسه درآمد واقعی تولید با نرخ دولتی vs برقینو */
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
    productionKwh ??
    MONTHLY_PRODUCTION.reduce((acc, p) => acc + p.production, 0);

  const govIncome = kwh * govRate;
  const barghinoIncome = kwh * barghinoRate;
  const diff = barghinoIncome - govIncome;
  const multiplier = govRate > 0 ? barghinoRate / govRate : 0;

  // تقریب سالانه از میانگین ماهانه
  const monthlyAvg = kwh / Math.max(MONTHLY_PRODUCTION.length, 1);
  const yearlyKwh = monthlyAvg * 12;
  const yearlyGov = yearlyKwh * govRate;
  const yearlyBarghino = yearlyKwh * barghinoRate;
  const yearlyDiff = yearlyBarghino - yearlyGov;

  return (
    <Panel className="overflow-hidden border-brand-100 bg-gradient-to-br from-brand-50/80 via-white to-amber-50/40">
      <PanelHeader
        title="اگر به دولت می‌فروختی چقدر می‌گرفتی؟"
        description={`مقایسه بر اساس تولید ${periodLabel} · ${kwh.toLocaleString("fa-IR")} kWh`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-center">
          <p className="text-xs font-medium text-slate-500">فروش به دولت</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-600">
            {toMillionLabel(govIncome)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {formatToman(govRate)} تومان/kWh
          </p>
        </div>

        <div className="rounded-2xl border-2 border-brand-400 bg-brand-50/90 p-4 text-center shadow-sm shadow-brand-500/10">
          <p className="text-xs font-medium text-brand-700">فروش به برقینو</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-brand-700">
            {toMillionLabel(barghinoIncome)}
          </p>
          <p className="mt-1 text-[11px] text-brand-600">
            {formatToman(barghinoRate)} تومان/kWh · بورس سبز
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-center">
          <p className="text-xs font-medium text-emerald-700">سود بیشتر با برقینو</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-emerald-700">
            +{toMillionLabel(diff)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">≈{multiplier.toFixed(0)}× نرخ دولتی</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">تقریب سالانه</p>
          <p className="mt-0.5 text-xs text-slate-500">
            دولت {toMillionLabel(yearlyGov)} · برقینو {toMillionLabel(yearlyBarghino)}
          </p>
        </div>
        <p className="mt-2 text-sm font-bold text-emerald-700 sm:mt-0">
          +{toMillionLabel(yearlyDiff)} تومان در سال
        </p>
      </div>
    </Panel>
  );
}
