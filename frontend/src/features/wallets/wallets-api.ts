import { ApiError, apiRequest } from "@/features/auth/lib/api";

export const WALLET_CURRENCY = "IRT" as const;
export const MAX_WALLET_MONEY = 9_007_199_254_740_991;

export type WalletStatus = "active" | "frozen" | "disabled";
export type TransactionKind =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "refund"
  | "reversal"
  | "adjustment";

export type Wallet = {
  readonly uuid: string;
  readonly currency: typeof WALLET_CURRENCY;
  readonly status: WalletStatus;
  readonly balance: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type WalletBalance = {
  readonly uuid: string;
  readonly balance: number;
  readonly currency: typeof WALLET_CURRENCY;
  readonly status: WalletStatus;
};

export type WalletTransaction = {
  readonly uuid: string;
  readonly reference: string;
  readonly kind: TransactionKind;
  readonly status: string;
  readonly amount: number;
  readonly currency: typeof WALLET_CURRENCY;
  readonly sourceWalletUuid: string | null;
  readonly destinationWalletUuid: string | null;
  readonly originalTransactionUuid: string | null;
  readonly description: string;
  readonly createdAt: string;
  readonly returnedAmount: number;
};

export type Page<T> = {
  readonly count: number;
  readonly next: boolean;
  readonly previous: boolean;
  readonly results: readonly T[];
};

export type TransferInput = {
  readonly destinationWalletUuid: string;
  readonly amount: number;
  readonly description?: string;
};

export type TransactionFilters = {
  readonly kind?: TransactionKind;
  readonly reference?: string;
  readonly createdAfter?: string;
  readonly createdBefore?: string;
  readonly page?: number;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("پاسخ سرویس قابل خواندن نیست.");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function money(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > MAX_WALLET_MONEY) {
    throw new Error("مبلغ دریافتی نامعتبر است.");
  }
  return value;
}

function isoDateTime(value: unknown): string {
  const raw = text(value);
  if (!raw || Number.isNaN(Date.parse(raw))) throw new Error("زمان تراکنش نامعتبر است.");
  return raw;
}

function isWalletStatus(value: unknown): value is WalletStatus {
  return value === "active" || value === "frozen" || value === "disabled";
}

function isTransactionKind(value: unknown): value is TransactionKind {
  return (
    value === "deposit" ||
    value === "withdrawal" ||
    value === "transfer" ||
    value === "refund" ||
    value === "reversal" ||
    value === "adjustment"
  );
}

function uuidOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const raw = text(value);
  if (!raw) throw new Error("شناسه کیف پول نامعتبر است.");
  return raw;
}

export function parseWallet(value: unknown): Wallet {
  const raw = record(value);
  if (!text(raw.uuid) || raw.currency !== WALLET_CURRENCY || !isWalletStatus(raw.status)) {
    throw new Error("اطلاعات کیف پول ناقص است.");
  }
  return {
    uuid: text(raw.uuid),
    currency: WALLET_CURRENCY,
    status: raw.status,
    balance: money(raw.balance),
    createdAt: isoDateTime(raw.created_at),
    updatedAt: isoDateTime(raw.updated_at),
  };
}

export function parseWalletBalance(value: unknown): WalletBalance {
  const raw = record(value);
  if (!text(raw.uuid) || raw.currency !== WALLET_CURRENCY || !isWalletStatus(raw.status)) {
    throw new Error("موجودی کیف پول قابل خواندن نیست.");
  }
  return {
    uuid: text(raw.uuid),
    balance: money(raw.balance),
    currency: WALLET_CURRENCY,
    status: raw.status,
  };
}

export function parseWalletTransaction(value: unknown): WalletTransaction {
  const raw = record(value);
  if (!text(raw.uuid) || !text(raw.reference) || !isTransactionKind(raw.kind)) {
    throw new Error("اطلاعات تراکنش ناقص است.");
  }
  if (raw.currency !== WALLET_CURRENCY) throw new Error("ارز تراکنش پشتیبانی نمی‌شود.");
  const returned =
    raw.returned_amount === undefined || raw.returned_amount === null
      ? 0
      : money(raw.returned_amount);
  return {
    uuid: text(raw.uuid),
    reference: text(raw.reference),
    kind: raw.kind,
    status: text(raw.status) || "posted",
    amount: money(raw.amount),
    currency: WALLET_CURRENCY,
    sourceWalletUuid: uuidOrNull(raw.source_wallet_uuid),
    destinationWalletUuid: uuidOrNull(raw.destination_wallet_uuid),
    originalTransactionUuid: uuidOrNull(raw.original_transaction_uuid),
    description: text(raw.description),
    createdAt: isoDateTime(raw.created_at),
    returnedAmount: returned,
  };
}

export function parsePage<T>(value: unknown, parse: (item: unknown) => T): Page<T> {
  const raw = record(value);
  if (
    !Array.isArray(raw.results) ||
    typeof raw.count !== "number" ||
    !Number.isSafeInteger(raw.count) ||
    raw.count < 0
  ) {
    throw new Error("فهرست دریافتی ناقص است.");
  }
  return {
    count: raw.count,
    next: typeof raw.next === "string",
    previous: typeof raw.previous === "string",
    results: raw.results.map(parse),
  };
}

export async function listWallets(signal: AbortSignal): Promise<Page<Wallet>> {
  return parsePage(
    await apiRequest<unknown>("/wallets/?page_size=20", { auth: true, signal }),
    parseWallet,
  );
}

export async function createWallet(): Promise<Wallet> {
  return parseWallet(
    await apiRequest<unknown>("/wallets/", {
      auth: true,
      method: "POST",
      body: { currency: WALLET_CURRENCY },
    }),
  );
}

export async function getWallet(uuid: string, signal: AbortSignal): Promise<Wallet> {
  return parseWallet(
    await apiRequest<unknown>(`/wallets/${encodeURIComponent(uuid)}/`, { auth: true, signal }),
  );
}

export async function getWalletBalance(uuid: string, signal: AbortSignal): Promise<WalletBalance> {
  return parseWalletBalance(
    await apiRequest<unknown>(`/wallets/${encodeURIComponent(uuid)}/balance/`, {
      auth: true,
      signal,
    }),
  );
}

export async function listWalletTransactions(
  walletUuid: string,
  filters: TransactionFilters,
  signal: AbortSignal,
): Promise<Page<WalletTransaction>> {
  const params = new URLSearchParams();
  params.set("page_size", "20");
  params.set("page", String(filters.page ?? 1));
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.reference) params.set("reference", filters.reference);
  if (filters.createdAfter) params.set("created_after", filters.createdAfter);
  if (filters.createdBefore) params.set("created_before", filters.createdBefore);
  return parsePage(
    await apiRequest<unknown>(
      `/wallets/${encodeURIComponent(walletUuid)}/transactions/?${params.toString()}`,
      { auth: true, signal },
    ),
    parseWalletTransaction,
  );
}

export async function getWalletTransaction(
  uuid: string,
  signal: AbortSignal,
): Promise<WalletTransaction> {
  return parseWalletTransaction(
    await apiRequest<unknown>(`/wallet-transactions/${encodeURIComponent(uuid)}/`, {
      auth: true,
      signal,
    }),
  );
}

export async function transferFromWallet(
  walletUuid: string,
  input: TransferInput,
  idempotencyKey: string,
): Promise<WalletTransaction> {
  return parseWalletTransaction(
    await apiRequest<unknown>(`/wallets/${encodeURIComponent(walletUuid)}/transfers/`, {
      auth: true,
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: {
        destination_wallet_uuid: input.destinationWalletUuid,
        amount: input.amount,
        currency: WALLET_CURRENCY,
        description: input.description?.trim() ?? "",
      },
    }),
  );
}

export type SettlementInput = {
  readonly amount: number;
  readonly referenceNamespace: string;
  readonly referenceId: string;
  readonly description?: string;
};

export type AdjustmentInput = {
  readonly amount: number;
  readonly direction: "increase" | "decrease";
  readonly description: string;
};

export type RefundInput = {
  readonly amount: number;
  readonly description: string;
};

export type ReversalInput = {
  readonly description: string;
};

export type WalletStatusInput = {
  readonly reason: string;
};

export function newIdempotencyKey(prefix = "wallet"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function listStaffWallets(
  page: number,
  signal: AbortSignal,
): Promise<Page<Wallet>> {
  return parsePage(
    await apiRequest<unknown>(`/staff/wallets/?page=${page}&page_size=50`, {
      auth: true,
      signal,
    }),
    parseWallet,
  );
}

export async function getStaffTransaction(
  uuid: string,
  signal: AbortSignal,
): Promise<WalletTransaction> {
  return parseWalletTransaction(
    await apiRequest<unknown>(`/staff/wallet-transactions/${encodeURIComponent(uuid)}/`, {
      auth: true,
      signal,
    }),
  );
}

export async function staffDeposit(
  walletUuid: string,
  input: SettlementInput,
  idempotencyKey: string,
): Promise<WalletTransaction> {
  return parseWalletTransaction(
    await apiRequest<unknown>(`/staff/wallets/${encodeURIComponent(walletUuid)}/deposits/`, {
      auth: true,
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: {
        amount: input.amount,
        currency: WALLET_CURRENCY,
        reference_namespace: input.referenceNamespace,
        reference_id: input.referenceId,
        description: input.description?.trim() ?? "",
      },
    }),
  );
}

export async function staffWithdraw(
  walletUuid: string,
  input: SettlementInput,
  idempotencyKey: string,
): Promise<WalletTransaction> {
  return parseWalletTransaction(
    await apiRequest<unknown>(`/staff/wallets/${encodeURIComponent(walletUuid)}/withdrawals/`, {
      auth: true,
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: {
        amount: input.amount,
        currency: WALLET_CURRENCY,
        reference_namespace: input.referenceNamespace,
        reference_id: input.referenceId,
        description: input.description?.trim() ?? "",
      },
    }),
  );
}

export async function staffAdjust(
  walletUuid: string,
  input: AdjustmentInput,
  idempotencyKey: string,
): Promise<WalletTransaction> {
  return parseWalletTransaction(
    await apiRequest<unknown>(`/staff/wallets/${encodeURIComponent(walletUuid)}/adjustments/`, {
      auth: true,
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: {
        amount: input.amount,
        currency: WALLET_CURRENCY,
        direction: input.direction,
        description: input.description.trim(),
      },
    }),
  );
}

export async function staffRefund(
  transactionUuid: string,
  input: RefundInput,
  idempotencyKey: string,
): Promise<WalletTransaction> {
  return parseWalletTransaction(
    await apiRequest<unknown>(
      `/staff/wallet-transactions/${encodeURIComponent(transactionUuid)}/refunds/`,
      {
        auth: true,
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: {
          amount: input.amount,
          currency: WALLET_CURRENCY,
          description: input.description.trim(),
        },
      },
    ),
  );
}

export async function staffReverse(
  transactionUuid: string,
  input: ReversalInput,
  idempotencyKey: string,
): Promise<WalletTransaction> {
  return parseWalletTransaction(
    await apiRequest<unknown>(
      `/staff/wallet-transactions/${encodeURIComponent(transactionUuid)}/reversals/`,
      {
        auth: true,
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: {
          currency: WALLET_CURRENCY,
          description: input.description.trim(),
        },
      },
    ),
  );
}

export async function staffSetWalletStatus(
  walletUuid: string,
  target: "freeze" | "unfreeze" | "disable",
  input: WalletStatusInput,
): Promise<Wallet> {
  return parseWallet(
    await apiRequest<unknown>(`/staff/wallets/${encodeURIComponent(walletUuid)}/${target}/`, {
      auth: true,
      method: "POST",
      body: { reason: input.reason.trim() },
    }),
  );
}

export function walletError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "نشست شما معتبر نیست؛ دوباره وارد شوید.";
    if (error.status === 403) {
      return "مجوز مالی کافی نیست. view_financials / operate_wallet / adjust_wallet / manage_wallet_status لازم است.";
    }
    if (error.status === 404) return "کیف پول یا تراکنش در دسترس نیست.";
    if (error.code === "insufficient_funds") return "موجودی برای این عملیات کافی نیست.";
    if (error.code === "wallet_inactive") return "کیف پول فعال نیست؛ حرکت وجه جدید ممکن نیست.";
    if (error.code === "same_wallet") return "مبدأ و مقصد نمی‌توانند یکسان باشند.";
    if (error.code === "balance_limit") return "مبلغ از سقف مجاز موجودی فراتر می‌رود.";
    if (error.code === "idempotency_conflict") {
      return "این کلید قبلاً با درخواست دیگری استفاده شده؛ دوباره تلاش کنید.";
    }
    if (error.code === "reference_conflict") {
      return "این مرجع تسویه قبلاً ثبت شده است؛ مرجع یکتا وارد کنید.";
    }
    if (error.code === "refund_limit") return "مبلغ برگشت از ماندهٔ قابل‌برگشت بیشتر است.";
    if (error.code === "invalid_original") return "این سند برای برگشت یا ابطال مجاز نیست.";
    if (error.code === "wallet_busy") return "سامانه مشغول است؛ چند لحظه بعد دوباره تلاش کنید.";
    if (error.code === "invalid_amount" || error.fields.amount) {
      return "مبلغ باید عدد صحیح تومان و حداقل ۱ باشد.";
    }
    if (error.code === "invalid_currency" || error.fields.currency) {
      return "فقط تومان صحیح (IRT) پشتیبانی می‌شود.";
    }
    if (error.fields.destination_wallet_uuid) {
      return "شناسه کیف پول مقصد معتبر نیست.";
    }
    if (error.fields.reference_namespace || error.fields.reference_id) {
      return "مرجع تسویه (namespace و id) را کامل و یکتا وارد کنید.";
    }
    if (error.fields.direction) return "جهت اصلاح را مشخص کنید.";
    if (error.fields.reason || error.fields.description) {
      return "دلیل یا توضیح عملیات را وارد کنید.";
    }
    if (error.status === 0 || error.status >= 500) {
      return "پاسخ سرویس دریافت نشد؛ دوباره تلاش کنید.";
    }
    return error.message || "درخواست مالی پذیرفته نشد.";
  }
  return "دریافت یا ثبت اطلاعات کیف پول انجام نشد. اتصال را بررسی کنید.";
}
