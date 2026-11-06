"use client";

import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  Drawer,
  EmptyState,
  Input,
  Skeleton,
  StatusPill,
  Textarea,
  useToast,
} from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { cn } from "@/shared/lib/cn";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import {
  directionForWallet,
  formatToman,
  KIND_FILTERS,
  localDateTime,
  shortUuid,
  transactionKindMeta,
  walletStatusMeta,
  type KindFilter,
} from "./wallet-model";
import {
  createWallet,
  listWalletTransactions,
  listWallets,
  transferFromWallet,
  walletError,
  type TransactionKind,
  type Wallet,
  type WalletTransaction,
} from "./wallets-api";
import "./wallets.css";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

type WalletState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly wallet: Wallet | null };

type TxState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | {
      readonly status: "ready";
      readonly count: number;
      readonly next: boolean;
      readonly previous: boolean;
      readonly results: readonly WalletTransaction[];
    };

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function TransferDrawer({
  open,
  wallet,
  onClose,
  onDone,
}: {
  readonly open: boolean;
  readonly wallet: Wallet;
  readonly onClose: () => void;
  readonly onDone: (tx: WalletTransaction) => void;
}): ReactElement {
  const { push: toast } = useToast();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);

  useEffect(() => {
    if (!open) return;
    setDestination("");
    setAmount("");
    setDescription("");
    setError(null);
    setSubmitting(false);
    setIdempotencyKey(newIdempotencyKey());
  }, [open]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmedDestination = destination.trim();
    const parsedAmount = Number(amount.replace(/[,\s٬]/g, ""));
    if (!trimmedDestination) {
      setError("شناسه کیف پول مقصد را وارد کنید.");
      return;
    }
    if (!Number.isInteger(parsedAmount) || parsedAmount < 1) {
      setError("مبلغ باید عدد صحیح تومان و حداقل ۱ باشد.");
      return;
    }
    if (trimmedDestination === wallet.uuid) {
      setError("مبدأ و مقصد نمی‌توانند یکسان باشند.");
      return;
    }

    setSubmitting(true);
    try {
      const tx = await transferFromWallet(
        wallet.uuid,
        {
          destinationWalletUuid: trimmedDestination,
          amount: parsedAmount,
          description,
        },
        idempotencyKey,
      );
      toast({ title: "انتقال ثبت شد", description: `${formatToman(tx.amount)} تومان منتقل شد.` });
      onDone(tx);
      onClose();
    } catch (caught: unknown) {
      const message = walletError(caught);
      setError(message);
      if (
        caught &&
        typeof caught === "object" &&
        "code" in caught &&
        (caught as { code?: string }).code === "idempotency_conflict"
      ) {
        setIdempotencyKey(newIdempotencyKey());
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="انتقال وجه"
      description="انتقال قطعی بین دو کیف پول فعال. Idempotency-Key برای جلوگیری از ثبت تکراری ارسال می‌شود."
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            انصراف
          </Button>
          <Button type="submit" form="wallet-transfer-form" disabled={submitting}>
            {submitting ? "در حال ثبت…" : "ثبت انتقال"}
          </Button>
        </div>
      }
    >
      <form id="wallet-transfer-form" className="wallet-form" onSubmit={onSubmit}>
        <p className="wallet-form-hint">
          موجودی قابل انتقال: <bdi dir="ltr">{formatToman(wallet.balance)}</bdi> تومان · فقط عدد صحیح
        </p>
        <Input
          label="شناسه کیف پول مقصد"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          dir="ltr"
          required
          autoComplete="off"
        />
        <Input
          label="مبلغ (تومان)"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="مثلاً ۲۵۰۰۰۰"
          required
        />
        <Textarea
          label="توضیح (اختیاری)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={1000}
          rows={3}
        />
        {error ? (
          <Alert tone="danger" title="انتقال انجام نشد">
            <p>{error}</p>
          </Alert>
        ) : null}
      </form>
    </Drawer>
  );
}

function TransactionDrawer({
  open,
  walletUuid,
  transaction,
  onClose,
}: {
  readonly open: boolean;
  readonly walletUuid: string;
  readonly transaction: WalletTransaction | null;
  readonly onClose: () => void;
}): ReactElement {
  if (!transaction) {
    return (
      <Drawer open={open} onClose={onClose} title="جزئیات تراکنش">
        <p className="text-sm text-foreground-muted">تراکنشی انتخاب نشده است.</p>
      </Drawer>
    );
  }

  const kind = transactionKindMeta(transaction.kind);
  const direction = directionForWallet(
    transaction.kind,
    walletUuid,
    transaction.sourceWalletUuid,
    transaction.destinationWalletUuid,
  );
  const sign = direction === "in" ? "+" : direction === "out" ? "−" : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={kind.label}
      description={localDateTime(transaction.createdAt)}
    >
      <div className="wallet-drawer-grid">
        <div className="wallet-drawer-row">
          <span>مبلغ</span>
          <strong dir="ltr">
            {sign}
            {formatToman(transaction.amount)} تومان
          </strong>
        </div>
        <div className="wallet-drawer-row">
          <span>وضعیت</span>
          <strong>{transaction.status === "posted" ? "ثبت‌شده" : transaction.status}</strong>
        </div>
        <div className="wallet-drawer-row">
          <span>مرجع</span>
          <strong dir="ltr">{transaction.reference}</strong>
        </div>
        <div className="wallet-drawer-row">
          <span>شناسه تراکنش</span>
          <strong dir="ltr">{transaction.uuid}</strong>
        </div>
        {transaction.sourceWalletUuid ? (
          <div className="wallet-drawer-row">
            <span>کیف پول مبدأ</span>
            <strong dir="ltr">{transaction.sourceWalletUuid}</strong>
          </div>
        ) : null}
        {transaction.destinationWalletUuid ? (
          <div className="wallet-drawer-row">
            <span>کیف پول مقصد</span>
            <strong dir="ltr">{transaction.destinationWalletUuid}</strong>
          </div>
        ) : null}
        {transaction.originalTransactionUuid ? (
          <div className="wallet-drawer-row">
            <span>سند اصلی</span>
            <strong dir="ltr">{transaction.originalTransactionUuid}</strong>
          </div>
        ) : null}
        <div className="wallet-drawer-row">
          <span>مبلغ برگشتی</span>
          <strong dir="ltr">{formatToman(transaction.returnedAmount)} تومان</strong>
        </div>
        {transaction.description ? (
          <div className="wallet-drawer-row">
            <span>توضیح</span>
            <strong>{transaction.description}</strong>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}

export function WalletWorkspace(): ReactElement {
  const reduceMotion = useReducedMotion();
  const { push: toast } = useToast();
  const filtersId = useId();
  const [walletAttempt, setWalletAttempt] = useState(0);
  const [walletState, setWalletState] = useState<WalletState>({ status: "loading" });
  const [creating, setCreating] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [txPage, setTxPage] = useState(1);
  const [txAttempt, setTxAttempt] = useState(0);
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const wallet = walletState.status === "ready" ? walletState.wallet : null;
  const statusMeta = wallet ? walletStatusMeta(wallet.status) : null;
  const canTransfer = wallet?.status === "active" && wallet.balance > 0;

  useEffect(() => {
    const controller = new AbortController();
    setWalletState({ status: "loading" });
    void listWallets(controller.signal)
      .then((page) => {
        if (!controller.signal.aborted) {
          setWalletState({ status: "ready", wallet: page.results[0] ?? null });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setWalletState({ status: "error", message: walletError(error) });
        }
      });
    return () => controller.abort();
  }, [walletAttempt]);

  useEffect(() => {
    if (!wallet) {
      setTxState({ status: "idle" });
      return;
    }
    const controller = new AbortController();
    setTxState({ status: "loading" });
    void listWalletTransactions(
      wallet.uuid,
      {
        page: txPage,
        kind: kindFilter === "all" ? undefined : (kindFilter as TransactionKind),
      },
      controller.signal,
    )
      .then((page) => {
        if (!controller.signal.aborted) {
          setTxState({
            status: "ready",
            count: page.count,
            next: page.next,
            previous: page.previous,
            results: page.results,
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setTxState({ status: "error", message: walletError(error) });
        }
      });
    return () => controller.abort();
  }, [wallet, kindFilter, txPage, txAttempt]);

  async function onCreateWallet() {
    setCreating(true);
    try {
      const created = await createWallet();
      toast({
        title: "کیف پول آماده است",
        description: "کیف پول تومان شما ساخته شد و موجودی اولیه صفر است.",
      });
      setWalletState({ status: "ready", wallet: created });
      setTxPage(1);
      setTxAttempt((value) => value + 1);
    } catch (error: unknown) {
      toast({ title: "ایجاد کیف پول ممکن نشد", description: walletError(error), tone: "danger" });
    } finally {
      setCreating(false);
    }
  }

  function reloadAll() {
    setWalletAttempt((value) => value + 1);
    setTxAttempt((value) => value + 1);
  }

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.07 } },
        },
      };

  return (
    <motion.div className="wallet-workspace" {...motionProps}>
      <motion.header variants={reduceMotion ? undefined : fadeUp}>
        <p className="wallet-kicker">دفتر مالی داخلی</p>
        <h2 className="text-h2 tracking-tight">کیف پول</h2>
        <p className="mt-2 max-w-2xl text-body text-foreground-muted">
          موجودی تومان، تاریخچهٔ قطعی تراکنش‌ها و انتقال بین کیف پول‌ها — بدون عدد ساختگی.
        </p>
      </motion.header>

      {walletState.status === "loading" ? (
        <div className="grid gap-4">
          <Skeleton className="h-56 rounded-[28px]" />
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-24 rounded-[18px]" />
            <Skeleton className="h-24 rounded-[18px]" />
            <Skeleton className="h-24 rounded-[18px]" />
          </div>
          <Skeleton className="h-72 rounded-[24px]" />
        </div>
      ) : walletState.status === "error" ? (
        <Alert tone="danger" title="دریافت کیف پول ممکن نشد">
          <p>{walletState.message}</p>
          <Button variant="secondary" className="mt-3" onClick={reloadAll}>
            تلاش دوباره
          </Button>
        </Alert>
      ) : !wallet ? (
        <motion.section className="wallet-create" variants={reduceMotion ? undefined : fadeUp}>
          <PanelArt
            name="stat-plants"
            width={140}
            height={140}
            className="size-28 rounded-[22px] object-cover shadow-[var(--panel-float)]"
          />
          <h3>هنوز کیف پولی ندارید</h3>
          <p>
            با ایجاد کیف پول تومان، موجودی صفر و تاریخچهٔ خالی آماده می‌شود. واریز و برداشت بانکی توسط
            اپراتور مالی ثبت می‌شود؛ شما می‌توانید موجودی و انتقال‌ها را ببینید.
          </p>
          <Button onClick={onCreateWallet} disabled={creating}>
            {creating ? "در حال ایجاد…" : "ایجاد کیف پول تومان"}
          </Button>
        </motion.section>
      ) : (
        <>
          <motion.section
            className="wallet-hero"
            variants={reduceMotion ? undefined : fadeUp}
            aria-label="موجودی کیف پول"
          >
            <div className="wallet-hero-top">
              <div className="min-w-0">
                <p className="wallet-hero-eyebrow">موجودی قابل مشاهده</p>
                <p className="wallet-balance" dir="ltr">
                  <bdi>{formatToman(wallet.balance)}</bdi>
                  <em>تومان</em>
                </p>
                <div className="wallet-hero-meta">
                  {statusMeta ? <StatusPill status={statusMeta.tone} label={statusMeta.label} /> : null}
                  <span>{statusMeta?.hint}</span>
                  <span>
                    ارز · <bdi dir="ltr">IRT</bdi>
                  </span>
                </div>
              </div>
              <PanelArt name="stat-plants" width={120} height={120} className="wallet-hero-art" />
            </div>
            <div className="wallet-hero-actions">
              <Button
                onClick={() => setTransferOpen(true)}
                disabled={!canTransfer}
                title={
                  wallet.status !== "active"
                    ? "کیف پول فعال نیست"
                    : wallet.balance <= 0
                      ? "موجودی برای انتقال کافی نیست"
                      : undefined
                }
              >
                انتقال وجه
              </Button>
              <Button variant="secondary" onClick={reloadAll}>
                تازه‌سازی
              </Button>
            </div>
          </motion.section>

          <motion.section
            className="wallet-stat-row"
            variants={reduceMotion ? undefined : fadeUp}
            aria-label="شناسه‌ها"
          >
            <div className="wallet-stat wallet-stat--sun">
              <span>شناسه کیف پول</span>
              <strong dir="ltr">{wallet.uuid}</strong>
            </div>
            <div className="wallet-stat wallet-stat--mint">
              <span>ایجاد</span>
              <strong>{localDateTime(wallet.createdAt)}</strong>
            </div>
            <div className="wallet-stat wallet-stat--sky">
              <span>آخرین به‌روزرسانی</span>
              <strong>{localDateTime(wallet.updatedAt)}</strong>
            </div>
          </motion.section>

          <motion.section
            className="wallet-panel"
            variants={reduceMotion ? undefined : fadeUp}
            aria-labelledby={filtersId}
          >
            <div className="wallet-panel-head">
              <div>
                <h3 id={filtersId}>تاریخچه تراکنش‌ها</h3>
                <p>
                  {txState.status === "ready"
                    ? `${faNumber(txState.count)} سند ثبت‌شده`
                    : "فیلتر بر اساس نوع عملیات"}
                </p>
              </div>
            </div>

            <div className="wallet-filters" role="tablist" aria-label="فیلتر نوع تراکنش">
              {KIND_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={kindFilter === item.value}
                  className={cn("wallet-filter", kindFilter === item.value && "is-active")}
                  onClick={() => {
                    setKindFilter(item.value);
                    setTxPage(1);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {txState.status === "loading" ? (
              <div className="grid gap-2">
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
              </div>
            ) : txState.status === "error" ? (
              <Alert tone="danger" title="دریافت تاریخچه ممکن نشد">
                <p>{txState.message}</p>
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() => setTxAttempt((value) => value + 1)}
                >
                  تلاش دوباره
                </Button>
              </Alert>
            ) : txState.status === "ready" && txState.results.length ? (
              <>
                <ul className="wallet-tx-list">
                  {txState.results.map((tx) => {
                    const kind = transactionKindMeta(tx.kind);
                    const direction = directionForWallet(
                      tx.kind,
                      wallet.uuid,
                      tx.sourceWalletUuid,
                      tx.destinationWalletUuid,
                    );
                    const sign = direction === "in" ? "+" : direction === "out" ? "−" : "";
                    return (
                      <li key={tx.uuid}>
                        <button
                          type="button"
                          className="wallet-tx"
                          onClick={() => setSelectedTx(tx)}
                        >
                          <span
                            className={cn("wallet-tx-icon", `wallet-tx-icon--${direction}`)}
                            aria-hidden
                          >
                            <Icon
                              name={direction === "in" ? "coins" : direction === "out" ? "card" : "bolt"}
                              className="size-4"
                            />
                          </span>
                          <div className="wallet-tx-copy">
                            <strong>{kind.label}</strong>
                            <span>
                              {localDateTime(tx.createdAt)}
                              {tx.description ? ` · ${tx.description}` : ` · ${shortUuid(tx.reference)}`}
                            </span>
                          </div>
                          <div className="wallet-tx-amount">
                            <strong
                              className={cn(
                                direction === "in" && "is-in",
                                direction === "out" && "is-out",
                              )}
                              dir="ltr"
                            >
                              {sign}
                              {formatToman(tx.amount)}
                            </strong>
                            <span>تومان</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {txState.next || txState.previous ? (
                  <div className="wallet-pagination">
                    <Button
                      variant="ghost"
                      disabled={!txState.previous}
                      onClick={() => setTxPage((page) => Math.max(1, page - 1))}
                    >
                      قبلی
                    </Button>
                    <span className="text-caption text-foreground-muted">
                      صفحهٔ {faNumber(txPage)}
                    </span>
                    <Button
                      variant="ghost"
                      disabled={!txState.next}
                      onClick={() => setTxPage((page) => page + 1)}
                    >
                      بعدی
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="wallet-empty">
                <EmptyState
                  hideIcon
                  className="border-0 bg-transparent p-0 shadow-none"
                  title="هنوز تراکنشی ثبت نشده"
                  description="وقتی واریز، برداشت یا انتقالی ثبت شود، اینجا نمایش داده می‌شود."
                  icon="coins"
                />
              </div>
            )}
          </motion.section>

          <TransferDrawer
            open={transferOpen}
            wallet={wallet}
            onClose={() => setTransferOpen(false)}
            onDone={() => {
              setWalletAttempt((value) => value + 1);
              setTxPage(1);
              setTxAttempt((value) => value + 1);
            }}
          />
          <TransactionDrawer
            open={Boolean(selectedTx)}
            walletUuid={wallet.uuid}
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
          />
        </>
      )}
    </motion.div>
  );
}
