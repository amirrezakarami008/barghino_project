import { DashboardPage, Panel, PanelHeader, StatusBadge } from "@/features/dashboard/components";
import { PAYMENTS } from "@/features/dashboard/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "پرداخت‌ها" };

export default function PaymentsPage() {
  return (
    <DashboardPage title="پرداخت‌ها" subtitle="تاریخچه تراکنش‌ها و روش‌های پرداخت">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "پرداخت این ماه", value: "۳۱,۰۰۰,۰۰۰", sub: "تومان" },
          { label: "اعتبار باقی‌مانده", value: "۳۷۲,۰۰۰,۰۰۰", sub: "تومان" },
          { label: "تراکنش موفق", value: "۱۲", sub: "مورد" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <Panel>
        <PanelHeader title="تاریخچه پرداخت" />
        <div className="space-y-3">
          {PAYMENTS.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{payment.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {payment.date} — {payment.method} — کد: {payment.reference}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-slate-900">{payment.amount} <span className="text-xs font-normal text-slate-500">تومان</span></p>
                <StatusBadge status={payment.status} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="mt-6">
        <PanelHeader title="روش‌های پرداخت" description="روش‌های فعال حساب شما" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["درگاه بانکی", "خرید اعتباری", "پرداخت اقساطی"].map((method) => (
            <div key={method} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">💳</span>
              <span className="font-medium text-slate-900">{method}</span>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}
