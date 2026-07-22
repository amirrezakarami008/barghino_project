import { DashboardPage, Panel, PanelHeader } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { BILL_ACCOUNTS, POWER_PACKAGES } from "@/features/dashboard/constants";
import { cn } from "@/shared/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "خرید برق" };

export default function BuyPowerPage() {
  return (
    <DashboardPage title="خرید برق" subtitle="انتخاب پکیج و عقد قرارداد تامین برق">
      <Panel className="mb-6">
        <PanelHeader title="انتخاب واحد مصرفی" />
        <div className="flex flex-wrap gap-2">
          {BILL_ACCOUNTS.filter((b) => b.status === "active").map((bill) => (
            <button
              key={bill.id}
              type="button"
              className="rounded-xl border-2 border-brand-500 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700"
            >
              {bill.name}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        {POWER_PACKAGES.map((pkg) => (
          <Panel
            key={pkg.id}
            className={cn(
              "relative flex flex-col",
              pkg.recommended && "ring-2 ring-brand-500 ring-offset-2",
            )}
          >
            {pkg.recommended && (
              <span className="absolute -top-3 right-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                پیشنهاد برق ما
              </span>
            )}
            <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
            <p className="mt-2 text-sm text-slate-500">{pkg.description}</p>
            <div className="my-4 rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{pkg.savings}</p>
              <p className="text-xs text-emerald-700">کاهش هزینه</p>
            </div>
            <p className="text-sm text-slate-600">مدت قرارداد: {pkg.duration}</p>
            <ul className="my-6 flex-1 space-y-2">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Button fullWidth variant={pkg.recommended ? "primary" : "outline"}>
              انتخاب پکیج
            </Button>
          </Panel>
        ))}
      </div>

      <Panel className="mt-6">
        <PanelHeader
          title="خرید اعتباری"
          description="مصرف کنید، بعداً پرداخت کنید — مناسب قراردادهای بلندمدت"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "سقف اعتبار", value: "۵۰۰ میلیون تومان" },
            { label: "اعتبار مصرف‌شده", value: "۱۲۸ میلیون تومان" },
            { label: "موعد تسویه بعدی", value: "۱۴۰۴/۰۷/۱۵" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}
