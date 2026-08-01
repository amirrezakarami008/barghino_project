import { DashboardPage, Panel, PanelHeader } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { SOLAR_PLANTS, HOME_SUBSCRIPTIONS } from "@/features/dashboard/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "فروش برق" };

const SELL_STEPS = [
  {
    step: 1,
    title: "معرفی نیروگاه",
    description: "شماره انشعاب و اطلاعات نیروگاه خود را ثبت کنید.",
  },
  {
    step: 2,
    title: "عقد قرارداد",
    description: "قرارداد فروش برق به نرخ بورس سبز امضا می‌شود.",
  },
  {
    step: 3,
    title: "تولید و اندازه‌گیری",
    description: "کنتور هوشمند، تولید ماهانه شما را ثبت می‌کند.",
  },
  {
    step: 4,
    title: "دریافت درآمد",
    description: "حداکثر ۲ ماه پس از پایان دوره، مبلغ به حسابتان واریز می‌شود.",
  },
];

const RATE_COMPARISON = [
  {
    label: "نرخ دولتی",
    rate: "۵٬۰۰۰",
    payment: "تا ۶ ماه",
    highlight: false,
  },
  {
    label: "نرخ برقینو (بورس سبز)",
    rate: "۱۵٬۰۰۰",
    payment: "حداکثر ۲ ماه",
    highlight: true,
  },
];

export default function SellPowerPage() {
  return (
    <DashboardPage
      title="فروش برق به برقینو"
      subtitle="برق تولیدی نیروگاه خانگی خود را با بهترین نرخ بفروشید"
    >
      {/* مقایسه نرخ */}
      <div className="grid gap-4 sm:grid-cols-2">
        {RATE_COMPARISON.map((item) => (
          <Panel
            key={item.label}
            className={
              item.highlight
                ? "border-2 border-brand-400 bg-gradient-to-br from-brand-50 to-emerald-50"
                : ""
            }
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {item.rate}
              <span className="mr-1 text-base font-normal text-slate-500">تومان/kWh</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">زمان پرداخت: {item.payment}</p>
            {item.highlight && (
              <span className="mt-3 inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                ۳× نرخ دولتی
              </span>
            )}
          </Panel>
        ))}
      </div>

      {/* مراحل فروش */}
      <Panel className="mt-6">
        <PanelHeader
          title="چطور برق بفروشم؟"
          description="۴ مرحله ساده تا شروع درآمد"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SELL_STEPS.map((s) => (
            <div key={s.step} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {s.step}
              </div>
              <p className="font-semibold text-slate-900">{s.title}</p>
              <p className="text-sm text-slate-500">{s.description}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* نیروگاه‌های فعال */}
      {SOLAR_PLANTS.length > 0 && (
        <Panel className="mt-6">
          <PanelHeader
            title="نیروگاه‌های من"
            description="نیروگاه‌هایی که هم‌اکنون برق می‌فروشند"
          />
          <div className="space-y-3">
            {SOLAR_PLANTS.map((plant) => (
              <div
                key={plant.id}
                className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{plant.name}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{plant.address}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-600">{plant.capacityKwp} kWp</span>
                  <span className="font-bold text-emerald-600">{plant.monthlyProductionKwh} kWh/ماه</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <Button href="/dashboard/plant" variant="outline" size="sm">
              مدیریت نیروگاه
            </Button>
            <Button href="/dashboard/install" size="sm">
              افزودن نیروگاه جدید
            </Button>
          </div>
        </Panel>
      )}

      {/* اگر نیروگاه ندارد */}
      {HOME_SUBSCRIPTIONS.length > 0 && SOLAR_PLANTS.length === 0 && (
        <Panel className="mt-6">
          <PanelHeader
            title="هنوز نیروگاهی ندارید؟"
            description="برقینو نیروگاه خورشیدی را روی پشت‌بام شما نصب می‌کند."
          />
          <Button href="/dashboard/install" size="lg">
            درخواست نصب نیروگاه
          </Button>
        </Panel>
      )}
    </DashboardPage>
  );
}
