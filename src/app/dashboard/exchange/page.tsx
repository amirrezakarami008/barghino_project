import {
  DashboardPage,
  Panel,
  PanelHeader,
} from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import {
  formatMillionToman,
  getGreenExchangeSnapshot,
} from "@/features/dashboard/lib/insights";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "بورس سبز" };

export default function GreenExchangePage() {
  const data = getGreenExchangeSnapshot();
  const maxRate = Math.max(...data.history.map((h) => h.rate));

  return (
    <DashboardPage
      title="مرکز تحلیل بورس سبز"
      subtitle="نرخ نمونه، علت تغییر، و اثر آن روی درآمد شما"
      action={
        <Button href="/dashboard/reports" variant="outline" size="sm">
          گزارش ماهانه
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2 border-brand-100 bg-gradient-to-br from-brand-50/60 to-white">
          <p className="text-xs font-medium text-brand-700">{data.updatedAt}</p>
          <p className="mt-2 text-sm text-slate-500">نرخ بورس سبز (نمونه)</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="font-display text-4xl font-black text-slate-900">
              {data.currentRate.toLocaleString("fa-IR")}
            </p>
            <p className="mb-1 text-sm text-slate-500">تومان/kWh</p>
            <span
              className={`mb-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                data.direction === "up"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {data.direction === "up" ? "↑" : "↓"} {Math.abs(data.changePercent)}٪
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            نرخ قبلی: {data.previousRate.toLocaleString("fa-IR")} تومان
          </p>
        </Panel>

        <Panel className="border-emerald-100 bg-emerald-50/50">
          <PanelHeader title="اثر روی درآمد شما" />
          <p className="text-sm leading-7 text-slate-700">{data.personalImpact.message}</p>
          <p className="mt-3 font-display text-2xl font-extrabold text-emerald-700">
            ≈ {formatMillionToman(data.personalImpact.amount)} تومان
          </p>
        </Panel>
      </div>

      <Panel className="mb-6">
        <PanelHeader title="روند نرخ ۶ ماه اخیر" description="اعداد نمونه برای درک روند" />
        <div className="flex items-end justify-between gap-2 sm:gap-3">
          {data.history.map((point) => {
            const height = (point.rate / maxRate) * 100;
            return (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end justify-center sm:h-40">
                  <div
                    className="w-full max-w-[2.5rem] rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 sm:max-w-[3rem]"
                    style={{ height: `${height}%` }}
                    title={`${point.rate.toLocaleString("fa-IR")} تومان`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 sm:text-xs">{point.label}</span>
                <span className="hidden text-[10px] font-medium text-slate-700 sm:block">
                  {(point.rate / 1000).toFixed(1)}k
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="چرا نرخ تغییر کرد؟" />
          <div className="space-y-3">
            {data.drivers.map((driver) => (
              <div key={driver.label} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="font-semibold text-slate-900">{driver.label}</p>
                <p className="mt-1 text-sm text-slate-600">{driver.detail}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="سؤالات پرتکرار" />
          <div className="space-y-3">
            {data.faq.map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{item.q}</p>
                <p className="mt-1 text-sm leading-7 text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <p className="text-center text-xs text-slate-400">
        نرخ‌ها و تحلیل‌ها در نسخه فعلی نمونه‌اند و بعداً به داده زنده بورس سبز وصل می‌شوند.
      </p>
    </DashboardPage>
  );
}
