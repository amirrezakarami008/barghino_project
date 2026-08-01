import {
  DashboardPage,
  Panel,
  PanelHeader,
} from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import {
  formatMillionToman,
  getMonthlySmartReport,
} from "@/features/dashboard/lib/insights";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "گزارش ماهانه" };

export default function ReportsPage() {
  const report = getMonthlySmartReport();
  const isUp = report.growthPercent >= 0;

  return (
    <DashboardPage
      title="گزارش هوشمند ماهانه"
      subtitle="خلاصه قابل‌فهم از تولید، درآمد و پیشنهادهای نگهداری"
      action={
        <Button href="/dashboard/exchange" variant="outline" size="sm">
          مرکز بورس سبز
        </Button>
      }
    >
      <Panel className="mb-6 border-brand-100 bg-gradient-to-l from-brand-50/50 to-white">
        <PanelHeader title={`گزارش ${report.period}`} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "تولید برق",
              value: `${report.productionKwh.toLocaleString("fa-IR")} kWh`,
            },
            {
              label: "درآمد",
              value: `${formatMillionToman(report.income)} تومان`,
            },
            {
              label: "رشد نسبت به ماه قبل",
              value: `${isUp ? "↑" : "↓"} ${Math.abs(report.growthPercent)}٪`,
            },
            {
              label: "بهترین روز",
              value: report.bestDay.date,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/90 p-4 ring-1 ring-slate-100">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 font-display text-xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="نکات کلیدی" />
          <ul className="space-y-3">
            {report.insights.map((insight) => (
              <li
                key={insight}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-7 text-slate-700"
              >
                {insight}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="بهترین و ضعیف‌ترین روز" />
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs font-medium text-emerald-700">بهترین روز · {report.bestDay.date}</p>
              <p className="mt-1 font-bold text-slate-900">
                {report.bestDay.productionKwh.toLocaleString("fa-IR")} kWh
              </p>
              <p className="mt-1 text-sm text-slate-600">{report.bestDay.note}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
              <p className="text-xs font-medium text-amber-700">کمترین تولید · {report.worstDay.date}</p>
              <p className="mt-1 font-bold text-slate-900">
                {report.worstDay.productionKwh.toLocaleString("fa-IR")} kWh
              </p>
              <p className="mt-1 text-sm text-slate-600">{report.worstDay.note}</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="پیشنهاد برقینو" description="اقدامات ساده برای حفظ یا افزایش درآمد" />
        <div className="grid gap-3 sm:grid-cols-2">
          {report.recommendations.map((rec) => (
            <div
              key={rec.title}
              className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4"
            >
              <p className="font-semibold text-slate-900">{rec.title}</p>
              <p className="mt-1 text-sm text-brand-700">{rec.impact}</p>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}
