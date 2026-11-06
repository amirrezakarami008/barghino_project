"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import {
  Alert,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  Modal,
  Select,
  Skeleton,
  StatusPill,
  Textarea,
  useToast,
  type DataTableColumn,
} from "@/components/ui";
import {
  formatToman,
  localDateTime,
  shortUuid,
  transactionKindMeta,
  walletStatusMeta,
} from "@/features/wallets/wallet-model";
import {
  getStaffTransaction,
  listStaffWallets,
  newIdempotencyKey,
  staffAdjust,
  staffDeposit,
  staffRefund,
  staffReverse,
  staffSetWalletStatus,
  staffWithdraw,
  walletError,
  type Wallet,
  type WalletStatus,
  type WalletTransaction,
} from "@/features/wallets/wallets-api";
import { cn } from "@/shared/lib/cn";
import { faNumber } from "@/shared/lib/fa";
import { AdminPage } from "./admin-page";
import "./admin-wallets.css";

type ListState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | {
      readonly status: "ready";
      readonly count: number;
      readonly next: boolean;
      readonly previous: boolean;
      readonly results: readonly Wallet[];
    };

type StatusFilter = "all" | WalletStatus;
type MoneyOp = "deposit" | "withdraw" | "adjust" | null;
type StatusOp = "freeze" | "unfreeze" | "disable" | null;
type TxOp = "refund" | "reverse" | null;

function parsePositiveInt(value: string): number | null {
  const parsed = Number(value.replace(/[,\s٬]/g, ""));
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

function SettlementForm({
  kind,
  wallet,
  onClose,
  onDone,
  onBusyChange,
}: {
  readonly kind: "deposit" | "withdraw";
  readonly wallet: Wallet;
  readonly onClose: () => void;
  readonly onDone: (tx: WalletTransaction, walletHint: Wallet) => void;
  readonly onBusyChange: (busy: boolean) => void;
}): ReactElement {
  const { push: toast } = useToast();
  const [amount, setAmount] = useState("");
  const [referenceNamespace, setReferenceNamespace] = useState("bank-transfer");
  const [referenceId, setReferenceId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(() => newIdempotencyKey(kind));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsedAmount = parsePositiveInt(amount);
    if (parsedAmount === null) {
      setError("مبلغ باید عدد صحیح تومان و حداقل ۱ باشد.");
      return;
    }
    if (!referenceNamespace.trim() || !referenceId.trim()) {
      setError("مرجع تسویه (namespace و id) الزامی است.");
      return;
    }
    if (kind === "withdraw" && parsedAmount > wallet.balance) {
      setError("مبلغ برداشت از موجودی بیشتر است.");
      return;
    }

    onBusyChange(true);
    try {
      const input = {
        amount: parsedAmount,
        referenceNamespace: referenceNamespace.trim(),
        referenceId: referenceId.trim(),
        description,
      };
      const tx =
        kind === "deposit"
          ? await staffDeposit(wallet.uuid, input, key)
          : await staffWithdraw(wallet.uuid, input, key);
      const nextBalance =
        kind === "deposit" ? wallet.balance + parsedAmount : wallet.balance - parsedAmount;
      toast({
        title: kind === "deposit" ? "واریز ثبت شد" : "برداشت ثبت شد",
        description: `${formatToman(parsedAmount)} تومان`,
      });
      onDone(tx, { ...wallet, balance: nextBalance, updatedAt: new Date().toISOString() });
      onClose();
    } catch (caught: unknown) {
      setError(walletError(caught));
      if (
        caught &&
        typeof caught === "object" &&
        "code" in caught &&
        (caught as { code?: string }).code === "idempotency_conflict"
      ) {
        setKey(newIdempotencyKey(kind));
      }
    } finally {
      onBusyChange(false);
    }
  }

  return (
    <form id="admin-wallet-settlement" className="fo-form" onSubmit={onSubmit}>
      <p className={cn("fo-form__hint", kind === "withdraw" && "fo-form__hint")} data-tone={kind === "withdraw" ? "danger" : undefined}>
        {kind === "deposit"
          ? "فقط پس از احراز مرجع تسویه در خارج از سامانه ثبت کنید."
          : "برداشت فقط پس از احراز مرجع بیرونی. موجودی نمایش‌داده‌شده لزوماً قابل‌برداشت قطعی نیست."}{" "}
        موجودی فعلی: <bdi dir="ltr">{formatToman(wallet.balance)}</bdi> تومان
      </p>
      <div className="fo-amount">
        <Input
          label="مبلغ (تومان)"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          autoFocus
          dir="ltr"
        />
      </div>
      <Input
        label="Reference namespace"
        value={referenceNamespace}
        onChange={(event) => setReferenceNamespace(event.target.value)}
        dir="ltr"
        required
      />
      <Input
        label="Reference id"
        value={referenceId}
        onChange={(event) => setReferenceId(event.target.value)}
        dir="ltr"
        required
      />
      <Textarea
        label="توضیح (اختیاری)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={1000}
        rows={2}
      />
      {error ? (
        <Alert tone="danger" title="ثبت نشد">
          <p>{error}</p>
        </Alert>
      ) : null}
      <input type="submit" hidden />
    </form>
  );
}

function AdjustForm({
  wallet,
  onClose,
  onDone,
  onBusyChange,
}: {
  readonly wallet: Wallet;
  readonly onClose: () => void;
  readonly onDone: (tx: WalletTransaction, walletHint: Wallet) => void;
  readonly onBusyChange: (busy: boolean) => void;
}): ReactElement {
  const { push: toast } = useToast();
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(() => newIdempotencyKey("adjust"));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsedAmount = parsePositiveInt(amount);
    if (parsedAmount === null) {
      setError("مبلغ باید عدد صحیح تومان و حداقل ۱ باشد.");
      return;
    }
    if (!description.trim()) {
      setError("دلیل اصلاح الزامی است.");
      return;
    }
    if (direction === "decrease" && parsedAmount > wallet.balance) {
      setError("کاهش از موجودی بیشتر است.");
      return;
    }

    onBusyChange(true);
    try {
      const tx = await staffAdjust(
        wallet.uuid,
        { amount: parsedAmount, direction, description },
        key,
      );
      const nextBalance =
        direction === "increase" ? wallet.balance + parsedAmount : wallet.balance - parsedAmount;
      toast({ title: "اصلاح ثبت شد", description: `${formatToman(parsedAmount)} تومان` });
      onDone(tx, { ...wallet, balance: nextBalance, updatedAt: new Date().toISOString() });
      onClose();
    } catch (caught: unknown) {
      setError(walletError(caught));
      if (
        caught &&
        typeof caught === "object" &&
        "code" in caught &&
        (caught as { code?: string }).code === "idempotency_conflict"
      ) {
        setKey(newIdempotencyKey("adjust"));
      }
    } finally {
      onBusyChange(false);
    }
  }

  return (
    <form id="admin-wallet-adjust" className="fo-form" onSubmit={onSubmit}>
      <p className="fo-form__hint">
        اصلاح نیازمند مجوز adjust_wallet است. موجودی فعلی:{" "}
        <bdi dir="ltr">{formatToman(wallet.balance)}</bdi> تومان
      </p>
      <Select
        label="جهت اصلاح"
        value={direction}
        onChange={(event) => setDirection(event.target.value as "increase" | "decrease")}
        options={[
          { value: "increase", label: "افزایش" },
          { value: "decrease", label: "کاهش" },
        ]}
        required
      />
      <div className="fo-amount">
        <Input
          label="مبلغ (تومان)"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          autoFocus
          dir="ltr"
        />
      </div>
      <Textarea
        label="دلیل اصلاح"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={1000}
        rows={2}
        required
      />
      {error ? (
        <Alert tone="danger" title="اصلاح ثبت نشد">
          <p>{error}</p>
        </Alert>
      ) : null}
      <input type="submit" hidden />
    </form>
  );
}

function TxActionForm({
  kind,
  transaction,
  onClose,
  onDone,
  onBusyChange,
}: {
  readonly kind: "refund" | "reverse";
  readonly transaction: WalletTransaction;
  readonly onClose: () => void;
  readonly onDone: (tx: WalletTransaction) => void;
  readonly onBusyChange: (busy: boolean) => void;
}): ReactElement {
  const { push: toast } = useToast();
  const refundable = Math.max(0, transaction.amount - transaction.returnedAmount);
  const [amount, setAmount] = useState(String(refundable || ""));
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(() => newIdempotencyKey(kind));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!description.trim()) {
      setError("توضیح عملیات الزامی است.");
      return;
    }

    let parsedAmount = 0;
    if (kind === "refund") {
      const value = parsePositiveInt(amount);
      if (value === null) {
        setError("مبلغ باید عدد صحیح تومان و حداقل ۱ باشد.");
        return;
      }
      if (value > refundable) {
        setError(`حداکثر قابل برگشت ${formatToman(refundable)} تومان است.`);
        return;
      }
      parsedAmount = value;
    }

    onBusyChange(true);
    try {
      const tx =
        kind === "refund"
          ? await staffRefund(transaction.uuid, { amount: parsedAmount, description }, key)
          : await staffReverse(transaction.uuid, { description }, key);
      toast({
        title: kind === "refund" ? "برگشت ثبت شد" : "ابطال ثبت شد",
        description: transactionKindMeta(tx.kind).label,
      });
      onDone(tx);
      onClose();
    } catch (caught: unknown) {
      setError(walletError(caught));
      if (
        caught &&
        typeof caught === "object" &&
        "code" in caught &&
        (caught as { code?: string }).code === "idempotency_conflict"
      ) {
        setKey(newIdempotencyKey(kind));
      }
    } finally {
      onBusyChange(false);
    }
  }

  return (
    <form id="admin-wallet-tx-action" className="fo-form" onSubmit={onSubmit}>
      <p className="fo-form__hint" data-tone={kind === "reverse" ? "danger" : undefined}>
        سند {transactionKindMeta(transaction.kind).label} · مبلغ اصل{" "}
        <bdi dir="ltr">{formatToman(transaction.amount)}</bdi>
        {kind === "refund" ? (
          <>
            {" "}
            · قابل برگشت <bdi dir="ltr">{formatToman(refundable)}</bdi>
          </>
        ) : (
          " · ابطال کامل مبلغ سند اصلی. پس از Refund، Reversal مجاز نیست."
        )}
      </p>
      {kind === "refund" ? (
        <div className="fo-amount">
          <Input
            label="مبلغ برگشت (تومان)"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            autoFocus
            dir="ltr"
          />
        </div>
      ) : null}
      <Textarea
        label={kind === "refund" ? "دلیل برگشت" : "دلیل ابطال"}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={1000}
        rows={2}
        required
        autoFocus={kind === "reverse"}
      />
      {error ? (
        <Alert tone="danger" title="عملیات ثبت نشد">
          <p>{error}</p>
        </Alert>
      ) : null}
      <input type="submit" hidden />
    </form>
  );
}

export function AdminWallets(): ReactElement {
  const { push: toast } = useToast();
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [listState, setListState] = useState<ListState>({ status: "loading" });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [moneyOp, setMoneyOp] = useState<MoneyOp>(null);
  const [opBusy, setOpBusy] = useState(false);
  const [statusOp, setStatusOp] = useState<StatusOp>(null);
  const [statusReason, setStatusReason] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [inspected, setInspected] = useState<WalletTransaction | null>(null);
  const [txOp, setTxOp] = useState<TxOp>(null);
  const [recent, setRecent] = useState<readonly WalletTransaction[]>([]);

  function reloadWallets() {
    setListState({ status: "loading" });
    setAttempt((value) => value + 1);
  }

  function goToPage(nextPage: number) {
    setListState({ status: "loading" });
    setPage(nextPage);
  }

  useEffect(() => {
    const controller = new AbortController();
    void listStaffWallets(page, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setListState({
          status: "ready",
          count: data.count,
          next: data.next,
          previous: data.previous,
          results: data.results,
        });
        setSelectedUuid((current) => {
          if (current && data.results.some((item) => item.uuid === current)) return current;
          return data.results[0]?.uuid ?? null;
        });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setListState({ status: "error", message: walletError(error) });
        }
      });
    return () => controller.abort();
  }, [page, attempt]);

  const filtered = useMemo(() => {
    if (listState.status !== "ready") return [];
    if (statusFilter === "all") return listState.results;
    return listState.results.filter((item) => item.status === statusFilter);
  }, [listState, statusFilter]);

  const selected =
    listState.status === "ready"
      ? (listState.results.find((item) => item.uuid === selectedUuid) ?? null)
      : null;

  const counts = useMemo(() => {
    if (listState.status !== "ready") {
      return { active: 0, frozen: 0, disabled: 0, pageTotal: 0 };
    }
    return {
      pageTotal: listState.results.length,
      active: listState.results.filter((item) => item.status === "active").length,
      frozen: listState.results.filter((item) => item.status === "frozen").length,
      disabled: listState.results.filter((item) => item.status === "disabled").length,
    };
  }, [listState]);

  const columns = useMemo<readonly DataTableColumn<Wallet>[]>(
    () => [
      {
        id: "wallet",
        header: "کیف پول",
        mobilePrimary: true,
        cell: (wallet) => (
          <div className="fo-id">
            <span className="fo-id__code" dir="ltr">
              {shortUuid(wallet.uuid).toUpperCase()}
            </span>
            <span className="fo-id__hint" dir="ltr">
              …{wallet.uuid.slice(-12)}
            </span>
          </div>
        ),
      },
      {
        id: "balance",
        header: "موجودی",
        cell: (wallet) => (
          <p className="fo-money" dir="ltr">
            <bdi>{formatToman(wallet.balance)}</bdi>
            <em>تومان</em>
          </p>
        ),
      },
      {
        id: "status",
        header: "وضعیت",
        cell: (wallet) => {
          const meta = walletStatusMeta(wallet.status);
          return <StatusPill status={meta.tone} label={meta.label} />;
        },
      },
      {
        id: "updated",
        header: "آخرین تغییر",
        cell: (wallet) => (
          <time className="fo-date" dateTime={wallet.updatedAt}>
            {localDateTime(wallet.updatedAt)}
          </time>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: (wallet) => (
          <div className="fo-row-action">
            <Button
              size="sm"
              variant="secondary"
              disabled={wallet.status !== "active"}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedUuid(wallet.uuid);
                setOpBusy(false);
                setMoneyOp("deposit");
              }}
            >
              واریز
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  async function copyText(value: string, label: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(value);
      toast({ title: "کپی شد", description: label });
    } catch {
      toast({ title: "کپی نشد", description: "دسترسی کلیپ‌بورد در دسترس نیست.", tone: "danger" });
    }
  }

  function patchWallet(next: Wallet) {
    setListState((current) => {
      if (current.status !== "ready") return current;
      return {
        ...current,
        results: current.results.map((item) => (item.uuid === next.uuid ? next : item)),
      };
    });
  }

  function rememberTx(tx: WalletTransaction) {
    setRecent((current) => [tx, ...current.filter((item) => item.uuid !== tx.uuid)].slice(0, 8));
    setInspected(tx);
  }

  async function onLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uuid = lookupId.trim();
    setLookupError(null);
    if (!uuid) {
      setLookupError("شناسه تراکنش را وارد کنید.");
      return;
    }
    setLookupBusy(true);
    try {
      const tx = await getStaffTransaction(uuid, new AbortController().signal);
      setInspected(tx);
      rememberTx(tx);
      toast({ title: "تراکنش پیدا شد", description: transactionKindMeta(tx.kind).label });
    } catch (error: unknown) {
      const message = walletError(error);
      setLookupError(message);
      toast({ title: "جست‌وجو ناموفق", description: message, tone: "danger" });
    } finally {
      setLookupBusy(false);
    }
  }

  async function confirmStatusChange() {
    if (!selected || !statusOp) return;
    if (!statusReason.trim()) {
      setStatusError("دلیل تغییر وضعیت الزامی است.");
      return;
    }
    if (statusOp === "disable" && selected.balance !== 0) {
      setStatusError("غیرفعال‌سازی فقط با موجودی صفر مجاز است.");
      return;
    }
    setStatusBusy(true);
    setStatusError(null);
    try {
      const next = await staffSetWalletStatus(selected.uuid, statusOp, { reason: statusReason });
      patchWallet(next);
      toast({
        title: "وضعیت به‌روز شد",
        description: walletStatusMeta(next.status).label,
      });
      setStatusOp(null);
      setStatusReason("");
    } catch (error: unknown) {
      setStatusError(walletError(error));
    } finally {
      setStatusBusy(false);
    }
  }

  const canOperate = selected?.status === "active";
  const inspectedKind = inspected ? transactionKindMeta(inspected.kind) : null;

  return (
    <AdminPage
      className="fo-wallets"
      density="desk"
      title="کیف پول‌ها"
      description="میز عملیات مالی: واریز، برداشت، اصلاح، وضعیت و پیگیری تراکنش با مرجع تسویه یکتا."
    >
      {listState.status === "loading" ? (
        <div className="fo-loading">
          <Skeleton className="h-24 rounded-md" />
          <div className="fo-workspace">
            <Skeleton className="h-[28rem] rounded-md" />
            <Skeleton className="h-[28rem] rounded-md" />
          </div>
        </div>
      ) : listState.status === "error" ? (
        <Alert tone="danger" title="دریافت کیف پول‌ها ممکن نشد">
          <p>{listState.message}</p>
          <Button variant="secondary" className="mt-3" onClick={reloadWallets}>
            تلاش دوباره
          </Button>
        </Alert>
      ) : (
        <>
          <section className="fo-rail" aria-label="نمای کلی و فیلتر">
            <div className="fo-kpis">
              <div className="fo-kpi">
                <strong>{faNumber(listState.count)}</strong>
                <span>کل سامانه</span>
              </div>
              <div className="fo-kpi" data-tone="success">
                <strong>{faNumber(counts.active)}</strong>
                <span>فعال</span>
              </div>
              <div className="fo-kpi" data-tone="warning">
                <strong>{faNumber(counts.frozen)}</strong>
                <span>مسدود</span>
              </div>
              <div className="fo-kpi" data-tone="danger">
                <strong>{faNumber(counts.disabled)}</strong>
                <span>غیرفعال</span>
              </div>
            </div>
            <div className="fo-rail__controls">
              <div className="fo-filters" role="tablist" aria-label="فیلتر وضعیت">
                {(
                  [
                    ["all", "همه", undefined],
                    ["active", "فعال", "success"],
                    ["frozen", "مسدود", "warning"],
                    ["disabled", "غیرفعال", "danger"],
                  ] as const
                ).map(([value, label, tone]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === value}
                    data-tone={tone}
                    className={cn("fo-filter", statusFilter === value && "is-active")}
                    onClick={() => setStatusFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="fo-rail__aside">
                <p className="fo-rail__meta">
                  صفحهٔ {faNumber(page)} · {faNumber(filtered.length)} از {faNumber(counts.pageTotal)}
                </p>
                <Button size="sm" variant="secondary" onClick={reloadWallets}>
                  تازه‌سازی
                </Button>
              </div>
            </div>
          </section>

          <div className="fo-workspace">
            <section className="fo-ledger" aria-label="جدول کیف پول‌ها">
              <div className="fo-panel-head">
                <h3>دفتر کیف پول</h3>
              </div>
              <DataTable
                columns={columns}
                rows={filtered}
                getRowId={(wallet) => wallet.uuid}
                selectedRowId={selectedUuid}
                onRowClick={(wallet) => setSelectedUuid(wallet.uuid)}
                emptyTitle="کیف پولی در این فیلتر نیست"
                emptyDescription="فیلتر را عوض کنید یا صفحهٔ دیگری را ببینید."
              />
              {listState.next || listState.previous ? (
                <div className="fo-pager">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!listState.previous}
                    onClick={() => goToPage(Math.max(1, page - 1))}
                  >
                    قبلی
                  </Button>
                  <span>صفحهٔ {faNumber(page)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!listState.next}
                    onClick={() => goToPage(page + 1)}
                  >
                    بعدی
                  </Button>
                </div>
              ) : null}
            </section>

            <aside className="fo-console" aria-label="کنسول عملیات">
              <div className="fo-panel-head">
                <h3>کنسول عملیات</h3>
              </div>
              <div className="fo-console__body">
                {!selected ? (
                  <div className="fo-empty">
                    <EmptyState
                      title="کیف پولی انتخاب نشده"
                      description="یک ردیف از دفتر را انتخاب کنید."
                      icon="coins"
                    />
                  </div>
                ) : (
                  <>
                    <div className="fo-balance" data-status={selected.status}>
                      <div className="fo-balance__top">
                        <span className="fo-balance__label">موجودی جاری</span>
                        <StatusPill
                          status={walletStatusMeta(selected.status).tone}
                          label={walletStatusMeta(selected.status).label}
                        />
                      </div>
                      <p className="fo-balance__value" dir="ltr">
                        <bdi>{formatToman(selected.balance)}</bdi>
                        <em>تومان</em>
                      </p>
                    </div>

                    <dl className="fo-meta">
                      <div className="fo-meta__row">
                        <dt>کد</dt>
                        <dd dir="ltr">{shortUuid(selected.uuid).toUpperCase()}</dd>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="fo-meta__copy"
                          onClick={() => void copyText(selected.uuid, "شناسه کیف پول")}
                        >
                          کپی
                        </Button>
                      </div>
                      <div className="fo-meta__row">
                        <dt>UUID</dt>
                        <dd dir="ltr">{selected.uuid}</dd>
                        <span />
                      </div>
                      <div className="fo-meta__row">
                        <dt>به‌روزرسانی</dt>
                        <dd>{localDateTime(selected.updatedAt)}</dd>
                        <span />
                      </div>
                      <div className="fo-meta__row">
                        <dt>ایجاد</dt>
                        <dd>{localDateTime(selected.createdAt)}</dd>
                        <span />
                      </div>
                    </dl>

                    <div className="fo-ops">
                      <p className="fo-ops__label">عملیات مالی</p>
                      <div className="fo-ops__grid">
                        <Button
                          className="fo-ops__primary"
                          disabled={!canOperate}
                          onClick={() => {
                            setOpBusy(false);
                            setMoneyOp("deposit");
                          }}
                        >
                          واریز
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={!canOperate || selected.balance <= 0}
                          onClick={() => {
                            setOpBusy(false);
                            setMoneyOp("withdraw");
                          }}
                        >
                          برداشت
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={!canOperate}
                          onClick={() => {
                            setOpBusy(false);
                            setMoneyOp("adjust");
                          }}
                        >
                          اصلاح
                        </Button>
                      </div>
                      <p className="fo-ops__label">وضعیت</p>
                      <div className="fo-ops__grid">
                        {selected.status === "active" ? (
                          <Button variant="ghost" onClick={() => setStatusOp("freeze")}>
                            مسدود
                          </Button>
                        ) : null}
                        {selected.status === "frozen" ? (
                          <Button variant="ghost" onClick={() => setStatusOp("unfreeze")}>
                            رفع مسدودی
                          </Button>
                        ) : null}
                        {selected.status !== "disabled" ? (
                          <Button
                            variant="ghost"
                            disabled={selected.balance !== 0}
                            title={
                              selected.balance !== 0
                                ? "برای غیرفعال‌سازی موجودی باید صفر باشد"
                                : undefined
                            }
                            onClick={() => setStatusOp("disable")}
                          >
                            غیرفعال
                          </Button>
                        ) : (
                          <p className="text-caption text-foreground-muted">غیرفعال شده</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="fo-lookup">
                  <h4 className="fo-lookup__title">پیگیری تراکنش</h4>
                  <form className="fo-lookup__form" onSubmit={onLookup}>
                    <Input
                      label="UUID تراکنش"
                      value={lookupId}
                      onChange={(event) => {
                        setLookupId(event.target.value);
                        if (lookupError) setLookupError(null);
                      }}
                      dir="ltr"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      error={lookupError ?? undefined}
                    />
                    <Button type="submit" loading={lookupBusy}>
                      جست‌وجو
                    </Button>
                  </form>

                  {inspected && inspectedKind ? (
                    <div className="fo-tx">
                      <div className="fo-tx__head" data-tone={inspectedKind.tone}>
                        <span>{inspectedKind.label}</span>
                        <span dir="ltr">
                          <bdi>{formatToman(inspected.amount)}</bdi> تومان
                        </span>
                      </div>
                      <div className="fo-tx__meta">
                        <span>
                          شناسه: <bdi dir="ltr">{inspected.uuid}</bdi>
                        </span>
                        <span>
                          مرجع: <bdi dir="ltr">{shortUuid(inspected.reference)}</bdi>
                        </span>
                        <span>زمان: {localDateTime(inspected.createdAt)}</span>
                        <span>
                          برگشتی: <bdi dir="ltr">{formatToman(inspected.returnedAmount)}</bdi> تومان
                        </span>
                        {inspected.description ? <span>{inspected.description}</span> : null}
                      </div>
                      <div className="fo-tx__actions">
                        <Button size="sm" variant="secondary" onClick={() => setTxOp("refund")}>
                          برگشت
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setTxOp("reverse")}>
                          ابطال کامل
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void copyText(inspected.uuid, "شناسه تراکنش")}
                        >
                          کپی UUID
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {recent.length ? (
                    <div className="fo-recent">
                      <p className="fo-ops__label">عملیات اخیر نشست</p>
                      {recent.map((tx) => {
                        const meta = transactionKindMeta(tx.kind);
                        return (
                          <button
                            key={tx.uuid}
                            type="button"
                            className="fo-recent__item"
                            onClick={() => setInspected(tx)}
                          >
                            <span className="min-w-0">
                              <strong>{meta.label}</strong>
                              <span dir="ltr">{shortUuid(tx.uuid)}</span>
                            </span>
                            <em dir="ltr">
                              <bdi>{formatToman(tx.amount)}</bdi>
                            </em>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}

      <Modal
        open={moneyOp === "deposit" || moneyOp === "withdraw"}
        onClose={() => {
          if (opBusy) return;
          setMoneyOp(null);
        }}
        title={moneyOp === "withdraw" ? "برداشت" : "واریز"}
        description="ثبت قطعی در دفتر داخلی با مرجع تسویهٔ تأییدشده."
        className={cn(
          "fo-modal",
          moneyOp === "withdraw" ? "fo-modal--withdraw" : "fo-modal--deposit",
        )}
        footer={
          <div className="fo-form-actions">
            <Button variant="ghost" disabled={opBusy} onClick={() => setMoneyOp(null)}>
              انصراف
            </Button>
            <Button
              type="submit"
              form="admin-wallet-settlement"
              loading={opBusy}
              variant={moneyOp === "withdraw" ? "danger" : "primary"}
            >
              {moneyOp === "withdraw" ? "ثبت برداشت" : "ثبت واریز"}
            </Button>
          </div>
        }
      >
        {selected && (moneyOp === "deposit" || moneyOp === "withdraw") ? (
          <SettlementForm
            key={`${moneyOp}-${selected.uuid}`}
            kind={moneyOp}
            wallet={selected}
            onClose={() => setMoneyOp(null)}
            onBusyChange={setOpBusy}
            onDone={(tx, hint) => {
              rememberTx(tx);
              patchWallet(hint);
              reloadWallets();
            }}
          />
        ) : null}
      </Modal>

      <Modal
        open={moneyOp === "adjust"}
        onClose={() => {
          if (opBusy) return;
          setMoneyOp(null);
        }}
        title="اصلاح موجودی"
        description="نیازمند مجوز adjust_wallet و توضیح اجباری."
        className="fo-modal fo-modal--adjust"
        footer={
          <div className="fo-form-actions">
            <Button variant="ghost" disabled={opBusy} onClick={() => setMoneyOp(null)}>
              انصراف
            </Button>
            <Button type="submit" form="admin-wallet-adjust" loading={opBusy}>
              ثبت اصلاح
            </Button>
          </div>
        }
      >
        {selected && moneyOp === "adjust" ? (
          <AdjustForm
            key={`adjust-${selected.uuid}`}
            wallet={selected}
            onClose={() => setMoneyOp(null)}
            onBusyChange={setOpBusy}
            onDone={(tx, hint) => {
              rememberTx(tx);
              patchWallet(hint);
              reloadWallets();
            }}
          />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(txOp && inspected)}
        onClose={() => {
          if (opBusy) return;
          setTxOp(null);
        }}
        title={txOp === "reverse" ? "ابطال تراکنش" : "برگشت تراکنش"}
        description="برگشت/ابطال روی سند اصلی؛ پس از Refund، Reversal مجاز نیست."
        className={cn(
          "fo-modal",
          txOp === "reverse" ? "fo-modal--reverse" : "fo-modal--refund",
        )}
        footer={
          <div className="fo-form-actions">
            <Button variant="ghost" disabled={opBusy} onClick={() => setTxOp(null)}>
              انصراف
            </Button>
            <Button
              type="submit"
              form="admin-wallet-tx-action"
              loading={opBusy}
              variant={txOp === "reverse" ? "danger" : "primary"}
            >
              {txOp === "reverse" ? "ثبت ابطال" : "ثبت برگشت"}
            </Button>
          </div>
        }
      >
        {inspected && txOp ? (
          <TxActionForm
            key={`${txOp}-${inspected.uuid}`}
            kind={txOp}
            transaction={inspected}
            onClose={() => setTxOp(null)}
            onBusyChange={setOpBusy}
            onDone={(tx) => {
              rememberTx(tx);
              reloadWallets();
              void getStaffTransaction(inspected.uuid, new AbortController().signal)
                .then(setInspected)
                .catch(() => undefined);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(statusOp)}
        onClose={() => {
          if (statusBusy) return;
          setStatusOp(null);
          setStatusReason("");
          setStatusError(null);
        }}
        title={
          statusOp === "freeze"
            ? "مسدود کردن کیف پول"
            : statusOp === "unfreeze"
              ? "رفع مسدودی"
              : "غیرفعال‌سازی دائمی"
        }
        description="دلیل تغییر وضعیت ثبت و در audit نگه داشته می‌شود."
        confirmLabel="تأیید"
        cancelLabel="انصراف"
        pending={statusBusy}
        variant={statusOp === "disable" ? "danger" : "warning"}
        onConfirm={() => {
          void confirmStatusChange();
        }}
      >
        <div className="grid gap-3">
          <Textarea
            label="دلیل"
            value={statusReason}
            onChange={(event) => setStatusReason(event.target.value)}
            required
            rows={3}
            maxLength={1000}
          />
          {statusError ? (
            <Alert tone="danger" title="تغییر وضعیت ممکن نشد">
              <p>{statusError}</p>
            </Alert>
          ) : null}
          {statusOp === "disable" ? (
            <p className="text-sm text-foreground-muted">
              غیرفعال‌سازی برگشت‌ناپذیر است و فقط با موجودی صفر مجاز است.
            </p>
          ) : null}
        </div>
      </ConfirmDialog>
    </AdminPage>
  );
}
