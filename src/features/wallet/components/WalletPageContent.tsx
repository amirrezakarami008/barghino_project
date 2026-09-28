"use client";

import {
  DashboardPage,
  Panel,
  PanelHeader,
  StatusBadge,
} from "@/features/dashboard/components";
import { PAYMENT_METHODS, UPCOMING_PAYOUTS } from "@/features/dashboard/constants";
import { SITE_CONFIG } from "@/config";
import { WALLET_KIND_LABELS } from "@/features/wallet/constants";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import {
  depositToWallet,
  formatToman,
  withdrawFromWallet,
} from "@/features/wallet/lib/store";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { PaymentStatus, WalletTransaction } from "@/shared/types/dashboard";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  CreditCard,
  Eye,
  Filter,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type StatusFilter = "all" | PaymentStatus;
type DirectionFilter = "all" | "in" | "out";
type ModalMode = "deposit" | "withdraw" | null;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "success", label: "موفق" },
  { id: "processing", label: "در پردازش" },
  { id: "pending", label: "در انتظار" },
  { id: "failed", label: "ناموفق" },
];

export function WalletPageContent() {
  const { account, transactions } = useWallet();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WalletTransaction | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const bankMethod = PAYMENT_METHODS.find((m) => m.kind === "bank" && m.active);

  const totalIn = useMemo(
    () =>
      transactions
        .filter((t) => t.direction === "in" && t.status === "success")
        .reduce((s, t) => s + t.amountToman, 0),
    [transactions],
  );
  const totalOut = useMemo(
    () =>
      transactions
        .filter((t) => t.direction === "out" && (t.status === "success" || t.status === "processing"))
        .reduce((s, t) => s + t.amountToman, 0),
    [transactions],
  );
  const pendingOut = useMemo(
    () =>
      transactions
        .filter((t) => t.direction === "out" && t.status === "processing")
        .reduce((s, t) => s + t.amountToman, 0),
    [transactions],
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    return transactions.filter((tx) => {
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (directionFilter !== "all" && tx.direction !== directionFilter) return false;
      if (!q) return true;
      return [tx.title, tx.reference, tx.note, WALLET_KIND_LABELS[tx.kind]]
        .filter(Boolean)
        .join(" ")
        .includes(q);
    });
  }, [transactions, statusFilter, directionFilter, query]);

  const monthlyBars = useMemo(() => {
    const groups = new Map<string, { in: number; out: number }>();
    for (const tx of transactions.filter((t) => t.status === "success")) {
      const key = tx.date.slice(0, 7);
      const cur = groups.get(key) ?? { in: 0, out: 0 };
      if (tx.direction === "in") cur.in += tx.amountToman;
      else cur.out += tx.amountToman;
      groups.set(key, cur);
    }
    const items = [...groups.entries()].slice(0, 5);
    const max = Math.max(...items.flatMap(([, v]) => [v.in, v.out]), 1);
    return items.map(([label, value]) => ({
      label,
      in: value.in,
      out: value.out,
      inPct: Math.round((value.in / max) * 100),
      outPct: Math.round((value.out / max) * 100),
    }));
  }, [transactions]);

  function openModal(mode: ModalMode) {
    setModal(mode);
    setAmount("");
    setNote("");
    setError(null);
    setSuccessMsg(null);
  }

  function handleSubmitModal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const n = Number(amount.replace(/[٬,]/g, ""));
      if (!Number.isFinite(n) || n <= 0) {
        throw new Error("مبلغ معتبر وارد کنید.");
      }
      if (modal === "deposit") {
        const tx = depositToWallet(n, note || undefined);
        setSuccessMsg(`شارژ ${formatToman(tx.amountToman)} تومان با موفقیت انجام شد.`);
      } else if (modal === "withdraw") {
        const tx = withdrawFromWallet(n, {
          bankLast4: bankMethod?.meta?.slice(-4),
          note: note || undefined,
        });
        setSuccessMsg(
          `برداشت ${formatToman(tx.amountToman)} تومان در صف پردازش بانکی قرار گرفت.`,
        );
      }
      setModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "عملیات ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardPage
      title="کیف پول"
      subtitle="موجودی، شارژ، برداشت و تاریخچه تراکنش‌های مالی برقینو"
      action={
        <div className="flex flex-wrap gap-2">
          <Button href="/dashboard/payments" variant="outline" size="sm">
            پرداخت‌ها
          </Button>
          <Button href="/dashboard/invoices" variant="outline" size="sm">
            صورت‌حساب‌ها
          </Button>
        </div>
      }
    >
      {/* Hero */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-bl from-slate-900 via-emerald-900 to-brand-700 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-teal-300/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
              <Wallet className="h-3.5 w-3.5" />
              کیف پول برقینو
            </div>
            <p className="mt-5 text-sm text-emerald-100/80">موجودی قابل برداشت</p>
            <p className="mt-1 font-display text-4xl font-black tracking-tight sm:text-5xl">
              {formatToman(account.balanceToman)}
              <span className="ms-2 text-base font-semibold text-emerald-100/80">تومان</span>
            </p>
            <p className="mt-3 max-w-lg text-sm leading-7 text-emerald-50/85">
              درآمد فروش می‌تواند مستقیم به کیف پول بنشیند. هر زمان خواستید به شبا پیش‌فرض برداشت
              کنید یا کیف را شارژ کنید. تسویه با قرارداد رسمی حداکثر{" "}
              {SITE_CONFIG.valueProps.barghinoPayoutMonths} ماه.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                size="lg"
                className="bg-white text-emerald-900 hover:bg-emerald-50"
                onClick={() => openModal("withdraw")}
              >
                <ArrowUpRight className="h-4 w-4" />
                برداشت به شبا
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => openModal("deposit")}
              >
                <Plus className="h-4 w-4" />
                شارژ کیف پول
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-end">
            {[
              {
                label: "در انتظار از فروش",
                value: formatToman(account.pendingToman),
                hint: "صورت‌حساب در صف",
              },
              {
                label: "برداشت در پردازش",
                value: formatToman(pendingOut),
                hint: "واریز بانکی",
              },
              {
                label: "مجموع ورودی",
                value: formatToman(totalIn),
                hint: "تراکنش‌های موفق",
              },
              {
                label: "مجموع خروجی",
                value: formatToman(totalOut),
                hint: "برداشت‌ها",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <p className="text-[11px] text-emerald-100/75">{item.label}</p>
                <p className="mt-1 font-display text-lg font-black sm:text-xl">{item.value}</p>
                <p className="mt-0.5 text-[10px] text-emerald-100/60">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative mt-5 text-[11px] text-emerald-100/50">
          آخرین به‌روزرسانی: {account.lastUpdatedAt}
        </p>
      </section>

      {successMsg && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {successMsg}
        </div>
      )}
      {error && !modal && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Panel>
            <PanelHeader
              title="تاریخچه تراکنش‌ها"
              description="ورودی، خروجی و وضعیت هر تراکنش کیف پول"
              action={
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Filter className="h-3.5 w-3.5" />
                  {filtered.length.toLocaleString("fa-IR")} مورد
                </div>
              }
            />

            <div className="mb-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatusFilter(item.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold transition",
                      statusFilter === item.id
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["all", "همه جهت‌ها"],
                      ["in", "ورودی"],
                      ["out", "خروجی"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDirectionFilter(id)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        directionFilter === id
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="جستجوی عنوان یا کد پیگیری..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-3 ps-10 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center">
                <Wallet className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">تراکنشی در این فیلتر نیست</p>
                <p className="mt-1 text-xs text-slate-400">فیلتر را عوض کنید یا شارژ/برداشت جدید بزنید.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filtered.map((tx) => (
                  <li key={tx.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(tx)}
                      className="flex w-full items-center gap-3 py-3.5 text-start transition hover:bg-slate-50/80"
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                          tx.direction === "in"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {tx.direction === "in" ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">{tx.title}</p>
                          <StatusBadge status={tx.status} />
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {WALLET_KIND_LABELS[tx.kind]} · {tx.date} · {tx.reference}
                        </p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p
                          className={cn(
                            "font-display text-sm font-extrabold tabular-nums",
                            tx.direction === "in" ? "text-emerald-700" : "text-slate-800",
                          )}
                        >
                          {tx.direction === "in" ? "+" : "−"}
                          {formatToman(tx.amountToman)}
                        </p>
                        <p className="text-[10px] text-slate-400">تومان</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {monthlyBars.length > 0 && (
            <Panel>
              <PanelHeader title="جریان ماهانه" description="ورودی و خروجی موفق به تفکیک دوره" />
              <div className="space-y-4">
                {monthlyBars.map((row) => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{row.label}</span>
                      <span className="text-slate-400">
                        +{formatToman(row.in)} / −{formatToman(row.out)}
                      </span>
                    </div>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${Math.max(row.inPct, 4)}%` }}
                      />
                      <div
                        className="h-full rounded-full bg-amber-400/90 transition-all"
                        style={{ width: `${Math.max(row.outPct, 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> ورودی
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> خروجی
                  </span>
                </div>
              </div>
            </Panel>
          )}
        </div>

        <aside className="space-y-6">
          <Panel className="border-brand-100 bg-gradient-to-br from-brand-50/80 via-white to-emerald-50/50">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">مقصد درآمد</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  می‌توانید درآمد فروش را به کیف پول یا مستقیم به شبا واریز کنید. کیف پول برای
                  برداشت‌های جزئی و مدیریت نقدینگی مناسب‌تر است.
                </p>
              </div>
            </div>
          </Panel>

          {bankMethod && (
            <Panel>
              <PanelHeader title="حساب بانکی مقصد" description="برای برداشت از کیف پول" />
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{bankMethod.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{bankMethod.subtitle}</p>
                  <p className="mt-2 font-mono text-xs tracking-wide text-slate-600" dir="ltr">
                    {bankMethod.meta}
                  </p>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                variant="outline"
                onClick={() => openModal("withdraw")}
              >
                <Banknote className="h-4 w-4" />
                برداشت به این حساب
              </Button>
            </Panel>
          )}

          <Panel>
            <PanelHeader
              title="صورت‌حساب در صف"
              description="مبالغی که به‌زودی قابل واریز می‌شوند"
            />
            <ul className="space-y-3">
              {UPCOMING_PAYOUTS.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        موعد {item.dueDate} · {item.period}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-brand-700">
                      {item.amount}
                    </p>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/invoices"
              className="mt-4 inline-flex text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              مشاهده همه صورت‌حساب‌ها ←
            </Link>
          </Panel>

          <Panel>
            <PanelHeader title="دسترسی سریع" />
            <div className="grid gap-2">
              <QuickLink href="/dashboard/payments" icon={CreditCard} label="مرکز پرداخت‌ها" />
              <QuickLink href="/dashboard/invoices" icon={Banknote} label="صورت‌حساب‌های فروش" />
              <QuickLink href="/dashboard/production" icon={Eye} label="تولید و درآمد" />
            </div>
          </Panel>
        </aside>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-[2px] sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="font-display text-lg font-bold text-slate-900">جزئیات تراکنش</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">{selected.title}</p>
                <p
                  className={cn(
                    "mt-2 font-display text-3xl font-black",
                    selected.direction === "in" ? "text-emerald-700" : "text-slate-900",
                  )}
                >
                  {selected.direction === "in" ? "+" : "−"}
                  {formatToman(selected.amountToman)}
                </p>
                <p className="mt-1 text-xs text-slate-400">تومان</p>
                <div className="mt-3 flex justify-center">
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <dl className="space-y-2.5 text-sm">
                {[
                  ["نوع", WALLET_KIND_LABELS[selected.kind]],
                  ["تاریخ", selected.date],
                  ["کد پیگیری", selected.reference],
                  selected.bankLast4 ? ["شبا / کارت", `**** ${selected.bankLast4}`] : null,
                  selected.note ? ["توضیح", selected.note] : null,
                ]
                  .filter(Boolean)
                  .map((row) => {
                    const [label, value] = row as [string, string];
                    return (
                      <div key={label} className="flex justify-between gap-3">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="text-end font-semibold text-slate-800">{value}</dd>
                      </div>
                    );
                  })}
              </dl>
              {selected.invoiceId && (
                <Button href="/dashboard/invoices" variant="outline" className="w-full">
                  مشاهده صورت‌حساب مرتبط
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-[2px] sm:items-center"
          onClick={() => !busy && setModal(null)}
        >
          <form
            onSubmit={handleSubmitModal}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {modal === "deposit" ? "شارژ کیف پول" : "برداشت به شبا"}
              </h3>
              <button
                type="button"
                disabled={busy}
                onClick={() => setModal(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm leading-6 text-slate-600">
                {modal === "deposit"
                  ? "مبلغ را وارد کنید؛ در نسخه دمو شارژ بلافاصله به موجودی اضافه می‌شود."
                  : `موجودی قابل برداشت: ${formatToman(account.balanceToman)} تومان. برداشت در صف بانک قرار می‌گیرد.`}
              </p>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  مبلغ (تومان)
                </span>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="مثلاً ۵۰۰۰۰۰"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {(modal === "deposit"
                  ? [500_000, 1_000_000, 2_000_000]
                  : [500_000, 1_000_000, Math.min(account.balanceToman, 2_000_000)]
                ).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700"
                  >
                    {formatToman(preset)}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  توضیح (اختیاری)
                </span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="یادداشت برای این تراکنش"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
              </label>
              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ثبت…
                  </>
                ) : modal === "deposit" ? (
                  "تأیید شارژ"
                ) : (
                  "ثبت درخواست برداشت"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </DashboardPage>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof CreditCard;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-800"
    >
      <Icon className="h-4 w-4 text-brand-600" />
      {label}
    </Link>
  );
}
