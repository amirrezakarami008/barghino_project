import { DashboardPage, MobileDataCard, Panel, PanelHeader, ResponsiveTable, StatusBadge } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { SELL_INVOICES } from "@/features/dashboard/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "صورت‌حساب‌ها" };

export default function InvoicesPage() {
  const pending = SELL_INVOICES.filter((i) => i.status === "pending" || i.status === "processing");
  const paid = SELL_INVOICES.filter((i) => i.status === "paid");
  const totalPending = pending.reduce((acc, i) => {
    const num = Number(i.amount.replace(/[٬,]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));
    return acc + num;
  }, 0);

  return (
    <DashboardPage title="صورت‌حساب‌ها" subtitle="درآمد فروش برق و سابقه پرداخت‌های برقینو به شما">
      {pending.length > 0 && (
        <Panel className="mb-6 border-emerald-200 bg-emerald-50/30">
          <PanelHeader
            title={`${pending.length} صورت‌حساب در انتظار واریز`}
            description="برقینو حداکثر ۲ ماه پس از پایان دوره پرداخت می‌کند"
          />
        </Panel>
      )}

      <Panel className="mb-6">
        <PanelHeader title="صورت‌حساب‌های جاری" />
        <ResponsiveTable
          headers={["شماره", "نیروگاه", "دوره", "تولید (kWh)", "مبلغ (تومان)", "موعد پرداخت", "وضعیت"]}
          mobileCards={
            <>
              {SELL_INVOICES.map((inv) => (
                <MobileDataCard
                  key={inv.id}
                  title={inv.plantName}
                  badge={<StatusBadge status={inv.status} />}
                  fields={[
                    { label: "شماره", value: <span className="font-mono text-xs">{inv.number}</span> },
                    { label: "دوره", value: inv.period },
                    { label: "تولید", value: `${inv.energyKwh} kWh` },
                    { label: "مبلغ", value: `${inv.amount} تومان` },
                    { label: "موعد پرداخت", value: inv.dueDate },
                  ]}
                  action={<Button variant="ghost" size="sm" fullWidth>دانلود</Button>}
                />
              ))}
            </>
          }
          rows={SELL_INVOICES.map((inv) => [
            <span key="num" className="font-mono text-xs">{inv.number}</span>,
            <span key="plant" className="text-slate-700">{inv.plantName}</span>,
            <span key="period" className="text-slate-600">{inv.period}</span>,
            <span key="kwh" className="font-medium text-amber-600">{inv.energyKwh} kWh</span>,
            <span key="amount" className="font-semibold text-slate-900">{inv.amount}</span>,
            <span key="due" className="text-slate-600">{inv.dueDate}</span>,
            <StatusBadge key="status" status={inv.status} />,
          ])}
        />
      </Panel>

      {paid.length > 0 && (
        <Panel>
          <PanelHeader title="پرداخت‌های انجام‌شده" description={`${paid.length} صورت‌حساب`} />
          <div className="space-y-2">
            {paid.map((inv) => (
              <div key={inv.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span>{inv.period} — {inv.plantName}</span>
                <span className="font-medium text-emerald-600">واریز: {inv.paidDate}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </DashboardPage>
  );
}
