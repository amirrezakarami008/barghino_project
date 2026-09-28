"use client";

import {
  DashboardPage,
  Panel,
  PanelHeader,
  StatusBadge,
} from "@/features/dashboard/components";
import {
  PAYMENT_METHODS,
  PAYMENTS,
  SELL_INVOICES,
  UPCOMING_PAYOUTS,
} from "@/features/dashboard/constants";
import { SITE_CONFIG } from "@/config";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { triggerBlobDownload } from "@/shared/lib/pdfmake-client";
import type { Payment, PaymentStatus, SellInvoice } from "@/shared/types/dashboard";
import {
  generatePaymentReceiptPdf,
  generateSellInvoicePdf,
} from "../lib/generateFinancePdf";
import { formatToman, sumPersianAmounts } from "../lib/format";
import {
  ArrowUpLeft,
  Banknote,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Filter,
  Loader2,
  Search,
  Sparkles,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type StatusFilter = "all" | PaymentStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "success", label: "موفق" },
  { id: "processing", label: "در پردازش" },
  { id: "pending", label: "در انتظار" },
  { id: "failed", label: "ناموفق" },
];

const METHOD_ICON = {
  bank: Building2,
  credit: Wallet,
  installment: CreditCard,
} as const;

export function PaymentsPageContent() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const successPayments = PAYMENTS.filter((p) => p.status === "success");
  const processingPayments = PAYMENTS.filter((p) => p.status === "processing");
  const totalPaid = sumPersianAmounts(successPayments.map((p) => p.amount));
  const totalUpcoming = sumPersianAmounts(UPCOMING_PAYOUTS.map((p) => p.amount));
  const totalProcessing = sumPersianAmounts(processingPayments.map((p) => p.amount));

  const monthlyBars = useMemo(() => {
    const groups = new Map<string, number>();
    for (const p of PAYMENTS.filter((x) => x.status === "success")) {
      const key = p.period ?? p.date.slice(0, 7);
      groups.set(key, (groups.get(key) ?? 0) + sumPersianAmounts([p.amount]));
    }
    const items = [...groups.entries()].slice(0, 5).reverse();
    const max = Math.max(...items.map(([, v]) => v), 1);
    return items.map(([label, value]) => ({
      label,
      value,
      percent: Math.round((value / max) * 100),
    }));
  }, []);

  const q = query.trim();
  const filtered = PAYMENTS.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (!q) return true;
    const hay = [p.title, p.reference, p.plantName, p.period, p.invoiceNumber]
      .filter(Boolean)
      .join(" ");
    return hay.includes(q);
  });

  async function downloadPaymentReceipt(payment: Payment) {
    setBusyId(payment.id);
    setError(null);
    try {
      const blob = await generatePaymentReceiptPdf(payment);
      triggerBlobDownload(blob, `رسید-پرداخت-${payment.reference}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دانلود رسید ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  }

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

  async function downloadLinkedInvoice(payment: Payment) {
    if (!payment.invoiceId) {
      await downloadPaymentReceipt(payment);
      return;
    }
    const invoice = SELL_INVOICES.find((i) => i.id === payment.invoiceId);
    if (invoice) await downloadInvoice(invoice);
    else await downloadPaymentReceipt(payment);
  }

  return (
    <DashboardPage
      title="پرداخت‌ها"
      subtitle="واریز درآمد فروش برق، فاکتور رسمی و پیگیری تسویه"
      action={
        <div className="flex flex-wrap gap-2">
          <Button href="/dashboard/wallet" variant="outline" size="sm" className="gap-1.5">
            <Wallet className="h-4 w-4" />
            کیف پول
          </Button>
          <Button href="/dashboard/invoices" variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" />
            صورت‌حساب‌ها
          </Button>
        </div>
      }
    >
      {/* Hero */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-bl from-emerald-800 via-brand-700 to-teal-800 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" />
              تسویه با قرارداد رسمی حداکثر {SITE_CONFIG.valueProps.barghinoPayoutMonths} ماه
            </div>
            <h2 className="mt-4 font-display text-2xl font-black leading-snug sm:text-3xl">
              مرکز مالی فروش برق شما
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-emerald-50/90">
              وضعیت واریزها، فاکتورهای رسمی و حساب بانکی مقصد را از یکجا مدیریت کنید. برای هر تراکنش
              می‌توانید رسید یا فاکتور PDF بگیرید.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold ring-1 ring-white/15">
                {successPayments.length.toLocaleString("fa-IR")} واریز موفق
              </span>
              <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold ring-1 ring-white/15">
                {UPCOMING_PAYOUTS.length.toLocaleString("fa-IR")} صورت‌حساب در صف
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "کل واریز موفق", value: formatToman(totalPaid), sub: "تومان" },
              { label: "در صف پرداخت", value: formatToman(totalUpcoming), sub: "تومان" },
              { label: "در پردازش بانکی", value: formatToman(totalProcessing), sub: "تومان" },
              {
                label: "نرخ نمونه",
                value: SITE_CONFIG.valueProps.barghinoPrice,
                sub: "تومان/kWh",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <p className="text-[11px] text-emerald-100/80">{item.label}</p>
                <p className="mt-1 font-display text-xl font-black tracking-tight">{item.value}</p>
                <p className="text-[11px] text-emerald-100/70">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          {/* Filters + history */}
          <Panel>
            <PanelHeader
              title="تاریخچه پرداخت"
              description="جستجو، فیلتر و دانلود فاکتور / رسید"
              action={
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Filter className="h-3.5 w-3.5" />
                  {filtered.length.toLocaleString("fa-IR")} مورد
                </div>
              }
            />

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold transition",
                      filter === item.id
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجوی کد پیگیری، نیروگاه..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  موردی با این فیلتر پیدا نشد.
                </div>
              ) : (
                filtered.map((payment) => (
                  <article
                    key={payment.id}
                    className="group rounded-2xl border border-slate-200/80 bg-gradient-to-l from-white to-slate-50/60 p-4 transition hover:border-brand-200 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={payment.status} />
                          <span className="text-[11px] font-semibold text-slate-400">
                            {payment.method}
                          </span>
                        </div>
                        <h3 className="mt-2 font-bold text-slate-900">{payment.title}</h3>
                        <p className="mt-1 text-xs leading-6 text-slate-500">
                          {payment.date}
                          {payment.plantName ? ` · ${payment.plantName}` : ""}
                          {payment.period ? ` · ${payment.period}` : ""}
                          {` · کد: ${payment.reference}`}
                        </p>
                        {payment.energyKwh && payment.ratePerKwh ? (
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            {payment.energyKwh} kWh × {payment.ratePerKwh} تومان
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                        <p className="text-left font-display text-lg font-black text-slate-900 lg:text-right">
                          {payment.amount}
                          <span className="mr-1 text-xs font-medium text-slate-400">تومان</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelected(payment)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-brand-200 hover:text-brand-700"
                          >
                            جزئیات
                            <ArrowUpLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={busyId === payment.id}
                            onClick={() => void downloadPaymentReceipt(payment)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-brand-200 hover:text-brand-700 disabled:opacity-50"
                          >
                            {busyId === payment.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            رسید PDF
                          </button>
                          {payment.invoiceId ? (
                            <button
                              type="button"
                              disabled={busyId === payment.id || busyId === payment.invoiceId}
                              onClick={() => void downloadLinkedInvoice(payment)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              فاکتور
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>

          {/* Monthly trend */}
          <Panel>
            <PanelHeader title="روند واریزهای موفق" description="مقایسه دوره‌های اخیر" />
            <div className="space-y-3">
              {monthlyBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{bar.label}</span>
                    <span className="font-bold text-slate-900">
                      {formatToman(bar.value)} <span className="font-normal text-slate-400">تومان</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-brand-500 to-emerald-400 transition-all"
                      style={{ width: `${bar.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          {/* Upcoming */}
          <Panel className="border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white">
            <PanelHeader
              title="پرداخت‌های پیش‌رو"
              description="صورت‌حساب‌های در صف تسویه"
              action={<CalendarClock className="h-4 w-4 text-emerald-600" />}
            />
            <div className="space-y-3">
              {UPCOMING_PAYOUTS.map((item) => {
                const invoice = SELL_INVOICES.find((i) => i.id === item.invoiceId);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          موعد: {item.dueDate} · {item.period}
                        </p>
                      </div>
                      <p className="font-display text-sm font-black text-emerald-700">
                        {item.amount}
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                        <span>پیشرفت تسویه</span>
                        <span>{item.progressPercent.toLocaleString("fa-IR")}٪</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-emerald-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    {invoice ? (
                      <button
                        type="button"
                        disabled={busyId === invoice.id}
                        onClick={() => void downloadInvoice(invoice)}
                        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {busyId === invoice.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        دانلود فاکتور صورت‌حساب
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <Link
              href="/dashboard/invoices"
              className="mt-4 block text-center text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              مشاهده همه صورت‌حساب‌ها
            </Link>
          </Panel>

          {/* Methods */}
          <Panel>
            <PanelHeader title="روش‌های دریافت" description="مقصد واریز درآمد" />
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = METHOD_ICON[method.kind];
                return (
                  <div
                    key={method.id}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-4",
                      method.active
                        ? "border-slate-200 bg-white"
                        : "border-dashed border-slate-200 bg-slate-50 opacity-80",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        method.active
                          ? "bg-brand-50 text-brand-700"
                          : "bg-slate-200 text-slate-500",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{method.title}</p>
                        {method.active ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{method.subtitle}</p>
                      {method.meta ? (
                        <p className="mt-2 font-mono text-[11px] text-slate-600">{method.meta}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm leading-7 text-brand-900">
            <p className="flex items-center gap-2 font-bold">
              <Banknote className="h-4 w-4" />
              نکته تسویه
            </p>
            <p className="mt-1 text-brand-800/85">
              پس از تأیید تولید دوره، صورت‌حساب صادر و حداکثر طی{" "}
              {SITE_CONFIG.valueProps.barghinoPayoutMonths} ماه به حساب بانکی شما واریز می‌شود.
            </p>
          </div>
        </aside>
      </div>

      {/* Detail modal */}
      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <StatusBadge status={selected.status} />
                <h3 className="mt-3 font-display text-xl font-black text-slate-900">
                  {selected.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
              >
                بستن
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[
                ["مبلغ", `${selected.amount} تومان`],
                ["تاریخ", selected.date],
                ["روش", selected.method],
                ["کد پیگیری", selected.reference],
                ["نیروگاه", selected.plantName ?? "—"],
                ["دوره", selected.period ?? "—"],
                ["تولید", selected.energyKwh ? `${selected.energyKwh} kWh` : "—"],
                ["نرخ", selected.ratePerKwh ? `${selected.ratePerKwh} تومان` : "—"],
                ["صورت‌حساب", selected.invoiceNumber ?? "—"],
                [
                  "حساب بانکی",
                  selected.bankName
                    ? `${selected.bankName} · ****${selected.bankLast4 ?? ""}`
                    : "—",
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[11px] text-slate-500">{label}</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>

            {selected.description ? (
              <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-7 text-slate-600">
                {selected.description}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                className="gap-2"
                disabled={busyId === selected.id}
                onClick={() => void downloadPaymentReceipt(selected)}
              >
                {busyId === selected.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                دانلود رسید PDF
              </Button>
              {selected.invoiceId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={busyId === selected.invoiceId}
                  onClick={() => void downloadLinkedInvoice(selected)}
                >
                  <FileText className="h-4 w-4" />
                  دانلود فاکتور
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </DashboardPage>
  );
}
