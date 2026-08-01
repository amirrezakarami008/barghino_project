import { Panel, PanelHeader } from "./Panel";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { formatMillionToman, getIncomeForecast } from "@/features/dashboard/lib/insights";

export function IncomeForecastPanel() {
  const forecast = getIncomeForecast();

  return (
    <Panel>
      <PanelHeader
        title="پیش‌بینی درآمد"
        description={`اطمینان تقریبی ${forecast.confidence.toLocaleString("fa-IR")}٪ · بر اساس سابقه تولید و نرخ بورس سبز`}
        action={
          <Button href="/dashboard/reports" variant="ghost" size="sm" className="group">
            گزارش ماهانه
            <LinkArrow />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-xs text-slate-500">{forecast.nextWeek.label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">
            {formatMillionToman(forecast.nextWeek.income)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            تولید تقریبی {forecast.nextWeek.productionKwh.toLocaleString("fa-IR")} kWh
          </p>
        </div>
        <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
          <p className="text-xs text-brand-700">{forecast.nextMonth.label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-brand-800">
            {formatMillionToman(forecast.nextMonth.income)}
          </p>
          <p className="mt-1 text-xs text-brand-600">
            تولید تقریبی {forecast.nextMonth.productionKwh.toLocaleString("fa-IR")} kWh
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
        <p className="text-sm font-semibold text-emerald-800">
          اگر نرخ بورس {forecast.rateUpScenario.rateChangePercent}٪ بالا برود
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          درآمد ماه آینده حدود {formatMillionToman(forecast.rateUpScenario.income)} می‌شود
          <span className="font-bold">
            {" "}
            (+{formatMillionToman(forecast.rateUpScenario.extra)})
          </span>
        </p>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
        {forecast.assumptions.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
            {item}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
