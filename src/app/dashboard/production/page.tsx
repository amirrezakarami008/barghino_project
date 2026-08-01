import {
  DashboardPage,
  IncomeForecastPanel,
  MobileDataCard,
  Panel,
  PanelHeader,
  ProductionChart,
  ResponsiveTable,
  StatusBadge,
} from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { MONTHLY_PRODUCTION, SELL_INVOICES, SOLAR_PLANTS } from "@/features/dashboard/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "تولید و درآمد" };

const RATE_PER_KWH = 15_000;

function formatMillion(n: number) {
  return `${(n / 1_000_000).toFixed(1)} M`;
}

export default function ProductionPage() {
  const latest = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 1];
  const previous = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 2];
  const totalProduction = MONTHLY_PRODUCTION.reduce((acc, p) => acc + p.production, 0);
  const totalEarnings = MONTHLY_PRODUCTION.reduce((acc, p) => acc + p.earnings, 0);
  const changePercent = (
    ((latest.production - previous.production) / previous.production) *
    100
  ).toFixed(1);
  const isUp = Number(changePercent) >= 0;

  return (
    <DashboardPage title="تولید و درآمد" subtitle="پایش کامل تولید برق و درآمد حاصل از فروش به برقینو">
      {/* کارت‌های خلاصه */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "تولید ماه جاری",
            value: `${latest.production.toLocaleString("fa-IR")} kWh`,
            note: `${isUp ? "↑" : "↓"} ${Math.abs(Number(changePercent))}٪ نسبت به ماه قبل`,
            noteColor: isUp ? "text-emerald-600" : "text-red-500",
          },
          {
            label: "درآمد ماه جاری",
            value: `${formatMillion(latest.earnings)} M`,
            note: "نرخ بورس سبز: ۱۵٬۰۰۰ تومان/kWh",
            noteColor: "text-emerald-600",
          },
          {
            label: "تولید ۶ ماه",
            value: `${totalProduction.toLocaleString("fa-IR")} kWh`,
            note: "مجموع",
            noteColor: "text-slate-500",
          },
          {
            label: "درآمد ۶ ماه",
            value: `${formatMillion(totalEarnings)} M`,
            note: "میلیون تومان",
            noteColor: "text-slate-500",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
            <p className={`mt-1 text-xs ${item.noteColor}`}>{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <IncomeForecastPanel />
      </div>

      {/* نمودار ماهانه */}
      <Panel className="mb-6">
        <PanelHeader title="نمودار تولید و درآمد ماهانه" description="۶ ماه اخیر" />
        <ProductionChart data={MONTHLY_PRODUCTION} showEarnings />
      </Panel>

      {/* جزئیات ماهانه به صورت جدول */}
      <Panel className="mb-6">
        <PanelHeader title="جزئیات ماهانه" />
        <ResponsiveTable
          headers={["ماه", "تولید (kWh)", "نرخ (تومان/kWh)", "درآمد"]}
          mobileCards={
            <>
              {MONTHLY_PRODUCTION.map((p) => (
                <MobileDataCard
                  key={p.label}
                  title={p.label}
                  badge={undefined}
                  fields={[
                    { label: "تولید", value: `${p.production.toLocaleString("fa-IR")} kWh` },
                    { label: "نرخ", value: "۱۵٬۰۰۰ تومان" },
                    { label: "درآمد", value: `${formatMillion(p.earnings)} M تومان` },
                  ]}
                />
              ))}
            </>
          }
          rows={MONTHLY_PRODUCTION.map((p) => [
            <span key="month" className="font-medium text-slate-900">{p.label}</span>,
            <span key="prod" className="font-medium text-amber-600">{p.production.toLocaleString("fa-IR")}</span>,
            <span key="rate" className="text-slate-600">۱۵٬۰۰۰</span>,
            <span key="earn" className="font-bold text-emerald-600">{formatMillion(p.earnings)} M</span>,
          ])}
        />
      </Panel>

      {/* عملکرد هر نیروگاه */}
      <Panel className="mb-6">
        <PanelHeader
          title="عملکرد نیروگاه‌ها"
          action={
            <Button href="/dashboard/plant" variant="ghost" size="sm">
              مدیریت نیروگاه
            </Button>
          }
        />
        <div className="space-y-3">
          {SOLAR_PLANTS.map((plant) => {
            const monthlyEarnings = plant.monthlyProductionKwh * RATE_PER_KWH;
            const efficiencyPercent = Math.round(
              (plant.monthlyProductionKwh / (plant.capacityKwp * 150)) * 100,
            );
            return (
              <div
                key={plant.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{plant.name}</p>
                  <p className="text-xs text-slate-500">{plant.capacityKwp} kWp — {plant.address}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">تولید ماه جاری</p>
                    <p className="font-bold text-amber-600">{plant.monthlyProductionKwh} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">درآمد ماه جاری</p>
                    <p className="font-bold text-emerald-600">{formatMillion(monthlyEarnings)} M</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">بازدهی</p>
                    <p className="font-bold text-brand-600">{efficiencyPercent}٪</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* صورت‌حساب‌های اخیر */}
      <Panel>
        <PanelHeader
          title="آخرین صورت‌حساب‌های فروش"
          action={
            <Button href="/dashboard/invoices" variant="ghost" size="sm">
              همه صورت‌حساب‌ها
            </Button>
          }
        />
        <div className="space-y-3">
          {SELL_INVOICES.slice(0, 3).map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{inv.plantName}</p>
                <p className="text-xs text-slate-500">
                  {inv.period} — {inv.energyKwh} kWh × {inv.ratePerKwh} تومان
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-slate-900">{inv.amount} تومان</p>
                <StatusBadge status={inv.status} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}
