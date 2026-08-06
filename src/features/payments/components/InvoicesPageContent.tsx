"use client";

import {
  DashboardPage,
  MobileDataCard,
  Panel,
  PanelHeader,
  ResponsiveTable,
  StatusBadge,
} from "@/features/dashboard/components";
import { SELL_INVOICES } from "@/features/dashboard/constants";
import { generateSellInvoicePdf } from "@/features/payments";
import { formatToman, parsePersianAmount, sumPersianAmounts } from "@/features/payments/lib/format";
import { Button } from "@/shared/ui/Button";
import { triggerBlobDownload } from "@/shared/lib/pdfmake-client";
import type { SellInvoice } from "@/shared/types/dashboard";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export function InvoicesPageContent() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = SELL_INVOICES.filter((i) => i.status === "pending" || i.status === "processing");
  const paid = SELL_INVOICES.filter((i) => i.status === "paid");
  const totalPending = sumPersianAmounts(pending.map((i) => i.amount));
  const totalPaid = sumPersianAmounts(paid.map((i) => i.amount));

  async function downloadInvoice(invoice: SellInvoice) {
    setBusyId(invoice.id);
    setError(null);
    try {
      const blob = await generateSellInvoicePdf(invoice);
      triggerBlobDownload(blob, `فاکتور-${invoice.number}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دانلود فاکتور ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardPage
      title="صورت‌حساب‌ها"
      subtitle="درآمد فروش برق و سابقه پرداخت‌های برقینو به شما"
      action={
        <Button href="/dashboard/payments" variant="outline" size="sm">
          مرکز پرداخت‌ها
        </Button>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "در انتظار واریز",
            value: formatToman(totalPending),
            sub: `${pending.length.toLocaleString("fa-IR")} صورت‌حساب`,
          },
          {
            label: "پرداخت‌شده",
            value: formatToman(totalPaid),
            sub: `${paid.length.toLocaleString("fa-IR")} صورت‌حساب`,
          },
          {
            label: "میانگین مبلغ",
            value: formatToman(
              Math.round(
                SELL_INVOICES.reduce((a, i) => a + parsePersianAmount(i.amount), 0) /
                  Math.max(SELL_INVOICES.length, 1),
              ),
            ),
            sub: "تومان / صورت‌حساب",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-1 font-display text-xl font-black text-slate-900">
              {s.value}
              <span className="mr-1 text-xs font-medium text-slate-400">تومان</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {pending.length > 0 && (
        <Panel className="mb-6 border-emerald-200 bg-emerald-50/30">
          <PanelHeader
            title={`${pending.length.toLocaleString("fa-IR")} صورت‌حساب در انتظار واریز`}
            description="برقینو حداکثر ۲ ماه پس از پایان دوره پرداخت می‌کند — فاکتور PDF قابل دانلود است"
          />
        </Panel>
      )}

      <Panel className="mb-6">
        <PanelHeader title="همه صورت‌حساب‌ها" />
        <ResponsiveTable
          headers={["شماره", "نیروگاه", "دوره", "تولید (kWh)", "مبلغ (تومان)", "موعد", "وضعیت", ""]}
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
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="gap-1.5"
                      disabled={busyId === inv.id}
                      onClick={() => void downloadInvoice(inv)}
                    >
                      {busyId === inv.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      دانلود فاکتور
                    </Button>
                  }
                />
              ))}
            </>
          }
          rows={SELL_INVOICES.map((inv) => [
            <span key="num" className="font-mono text-xs">{inv.number}</span>,
            <span key="plant" className="text-slate-700">{inv.plantName}</span>,
            <span key="period" className="text-slate-600">{inv.period}</span>,
            <span key="kwh" className="font-medium text-amber-600">
              {inv.energyKwh} kWh
            </span>,
            <span key="amount" className="font-semibold text-slate-900">
              {inv.amount}
            </span>,
            <span key="due" className="text-slate-600">
              {inv.dueDate}
            </span>,
            <StatusBadge key="status" status={inv.status} />,
            <button
              key="dl"
              type="button"
              disabled={busyId === inv.id}
              onClick={() => void downloadInvoice(inv)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-brand-200 hover:text-brand-700 disabled:opacity-50"
            >
              {busyId === inv.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              فاکتور
            </button>,
          ])}
        />
      </Panel>

      {paid.length > 0 && (
        <Panel>
          <PanelHeader title="پرداخت‌های انجام‌شده" description={`${paid.length.toLocaleString("fa-IR")} صورت‌حساب`} />
          <div className="space-y-2">
            {paid.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  {inv.period} — {inv.plantName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-emerald-600">واریز: {inv.paidDate}</span>
                  <button
                    type="button"
                    disabled={busyId === inv.id}
                    onClick={() => void downloadInvoice(inv)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 disabled:opacity-50"
                  >
                    {busyId === inv.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    فاکتور
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </DashboardPage>
  );
}
