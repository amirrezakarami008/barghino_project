import {
  ConsumptionChart,
  DashboardPage,
  Panel,
  PanelHeader,
  UsageSummary,
} from "@/components/dashboard";
import { DAILY_CONSUMPTION, MONTHLY_CONSUMPTION } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مصرف و تحلیل" };

export default function ConsumptionPage() {
  const latest = MONTHLY_CONSUMPTION[MONTHLY_CONSUMPTION.length - 1];
  const previous = MONTHLY_CONSUMPTION[MONTHLY_CONSUMPTION.length - 2];

  return (
    <DashboardPage title="مصرف و تحلیل" subtitle="پایش مصرف، هزینه و الگوی اوج بار">
      <UsageSummary
        current={latest.usage}
        previous={previous.usage}
        peak={latest.peak ?? 820}
        average={415}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="مصرف ماهانه" description="۶ ماه اخیر — واحد: kWh" />
          <ConsumptionChart data={MONTHLY_CONSUMPTION} showCost />
        </Panel>
        <Panel>
          <PanelHeader title="مصرف هفتگی" description="۷ روز اخیر" />
          <ConsumptionChart data={DAILY_CONSUMPTION} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "هشدار اوج بار",
            desc: "مصرف ساعات ۱۴–۱۶ بالاتر از میانگین — پیشنهاد: مدیریت بار",
            color: "border-amber-200 bg-amber-50",
          },
          {
            title: "ضریب قدرت",
            desc: "ضریب قدرت ۰.۹۲ — در محدوده مجاز",
            color: "border-emerald-200 bg-emerald-50",
          },
          {
            title: "پیش‌بینی ماه بعد",
            desc: "مصرف تخمینی: ۱۱,۸۰۰ kWh — ۵٪ کمتر از ماه جاری",
            color: "border-brand-200 bg-brand-50",
          },
        ].map((item) => (
          <div key={item.title} className={`rounded-2xl border p-5 ${item.color}`}>
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </DashboardPage>
  );
}
