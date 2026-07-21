import { DashboardPage, MobileDataCard, Panel, PanelHeader, ResponsiveTable, StatusBadge } from "@/components/dashboard";
import { Button } from "@/components/ui/Button";
import { INVOICES } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "فاکتورها" };

export default function InvoicesPage() {
  const pending = INVOICES.filter((i) => i.status === "pending");
  const paid = INVOICES.filter((i) => i.status === "paid");

  return (
    <DashboardPage title="فاکتورها" subtitle="مشاهده و پرداخت فاکتورهای برق">
      {pending.length > 0 && (
        <Panel className="mb-6 border-amber-200 bg-amber-50/30">
          <PanelHeader
            title={`${pending.length} فاکتور در انتظار پرداخت`}
            description="مجموع: ۲۹,۱۰۰,۰۰۰ تومان"
          />
          <Button>پرداخت همه</Button>
        </Panel>
      )}

      <Panel className="mb-6">
        <PanelHeader title="فاکتورهای جاری" />
        <ResponsiveTable
          headers={["شماره", "واحد", "دوره", "مبلغ (تومان)", "سررسید", "وضعیت", "عملیات"]}
          mobileCards={
            <>
              {INVOICES.map((inv) => (
                <MobileDataCard
                  key={inv.id}
                  title={inv.billAccount}
                  badge={<StatusBadge status={inv.status} />}
                  fields={[
                    { label: "شماره", value: <span className="font-mono text-xs">{inv.number}</span> },
                    { label: "دوره", value: inv.period },
                    { label: "مبلغ", value: `${inv.amount} تومان` },
                    { label: "سررسید", value: inv.dueDate },
                  ]}
                  action={
                    inv.status === "pending" ? (
                      <Button size="sm" fullWidth>پرداخت</Button>
                    ) : (
                      <Button variant="ghost" size="sm" fullWidth>دانلود</Button>
                    )
                  }
                />
              ))}
            </>
          }
          rows={INVOICES.map((inv) => [
            <span key="num" className="font-mono text-xs">{inv.number}</span>,
            <span key="unit" className="text-slate-700">{inv.billAccount}</span>,
            <span key="period" className="text-slate-600">{inv.period}</span>,
            <span key="amount" className="font-semibold text-slate-900">{inv.amount}</span>,
            <span key="due" className="text-slate-600">{inv.dueDate}</span>,
            <StatusBadge key="status" status={inv.status} />,
            inv.status === "pending" ? (
              <Button key="action" size="sm">پرداخت</Button>
            ) : (
              <Button key="action" variant="ghost" size="sm">دانلود</Button>
            ),
          ])}
        />
      </Panel>

      <Panel>
        <PanelHeader title="سوابق پرداخت‌شده" description={`${paid.length} فاکتور`} />
        <div className="space-y-2">
          {paid.map((inv) => (
            <div key={inv.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>{inv.period} — {inv.billAccount}</span>
              <span className="font-medium text-emerald-600">پرداخت: {inv.paidDate}</span>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}
