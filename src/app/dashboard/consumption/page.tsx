import {
  DashboardPage,
  Panel,
  PanelHeader,
  ProductionChart,
} from "@/features/dashboard/components";
import { MONTHLY_PRODUCTION, SOLAR_PLANTS } from "@/features/dashboard/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "تولید و درآمد" };

export default function ProductionPage() {
  const latest = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 1];
  const previous = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 2];
  const totalProduction = MONTHLY_PRODUCTION.reduce((acc, p) => acc + p.production, 0);
  const totalEarnings = MONTHLY_PRODUCTION.reduce((acc, p) => acc + p.earnings, 0);
  const changePercent = (((latest.production - previous.production) / previous.production) * 100).toFixed(1);

  return (
    <DashboardPage title="تولید و درآمد" subtitle="پایش تولید برق و درآمد حاصل از فروش">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "تولید ماه جاری", value: `${latest.production.toLocaleString("fa-IR")} kWh`, note: `${Number(changePercent) >= 0 ? "↑" : "↓"} ${Math.abs(Number(changePercent))}٪` },
          { label: "درآمد ماه جاری", value: `${(latest.earnings / 1_000_000).toFixed(1)} M`, note: "میلیون تومان" },
          { label: "تولید ۶ ماه", value: `${totalProduction.toLocaleString("fa-IR")} kWh`, note: "مجموع" },
          { label: "درآمد ۶ ماه", value: `${(totalEarnings / 1_000_000).toFixed(0)} M`, note: "میلیون تومان" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
            <p className="text-xs text-emerald-600">{item.note}</p>
          </div>
        ))}
      </div>

      <Panel className="mt-8">
        <PanelHeader title="تولید ماهانه" description="۶ ماه اخیر — واحد: kWh" />
        <ProductionChart data={MONTHLY_PRODUCTION} showEarnings />
      </Panel>

      <Panel className="mt-6">
        <PanelHeader title="عملکرد نیروگاه‌ها" />
        <div className="space-y-3">
          {SOLAR_PLANTS.map((plant) => {
            const earningsPerKwh = 15_000;
            const monthlyEarnings = plant.monthlyProductionKwh * earningsPerKwh;
            return (
              <div key={plant.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{plant.name}</p>
                  <p className="text-xs text-slate-500">{plant.capacityKwp} kWp — {plant.address}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">تولید ماه جاری</p>
                    <p className="font-bold text-amber-600">{plant.monthlyProductionKwh} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">درآمد ماه جاری</p>
                    <p className="font-bold text-emerald-600">{(monthlyEarnings / 1_000_000).toFixed(1)} M</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </DashboardPage>
  );
}
