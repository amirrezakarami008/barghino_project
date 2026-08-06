import { DashboardPage, Panel, PanelHeader } from "@/features/dashboard/components";
import { SellPlantsPanel } from "@/features/dashboard/components/SellPlantsPanel";
import { Button } from "@/shared/ui/Button";
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
              <>
                <span className="mt-3 inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                  ۳× نرخ دولتی (نمونه فصل گرم)
                </span>
                <p className="mt-3 text-xs leading-5 text-slate-600">
                  فصل گرم: خرید با قیمت بالاتر · فصل سرد: تضمین خرید با ۱۰٪ بیشتر از نرخ دولتی.
                  نرخ دولتی اول سال تعیین و تا آخر سال ثابت می‌ماند.
                </p>
              </>
            )}
          </Panel>
        ))}
      </div>

      <Panel className="mt-6">
        <PanelHeader title="چطور برق بفروشم؟" description="۴ مرحله ساده تا شروع درآمد" />
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
        <div className="mt-4">
          <Button href="/dashboard/install" variant="outline" size="sm">
            اگر نیروگاه ندارید، اول نصب کنید
          </Button>
        </div>
      </Panel>

      <SellPlantsPanel />
    </DashboardPage>
  );
}
