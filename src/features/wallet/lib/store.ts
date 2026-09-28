import {
  SEED_WALLET_ACCOUNT,
  SEED_WALLET_TRANSACTIONS,
  WALLET_STORAGE_KEY,
  WALLET_UPDATED_EVENT,
} from "@/features/wallet/constants";
import type { WalletAccount, WalletTransaction } from "@/shared/types/dashboard";
import { formatToman, parsePersianAmount } from "@/features/payments/lib/format";

interface WalletState {
  account: WalletAccount;
  transactions: WalletTransaction[];
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WALLET_UPDATED_EVENT));
}

function formatWalletDate(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleDateString("fa-IR");
  }
}

function createTxId() {
  return `wt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function createReference() {
  const n = Math.floor(100000 + Math.random() * 900000);
  const fa = String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
  return `WLT-${fa}`;
}

function getDefaultState(): WalletState {
  return {
    account: { ...SEED_WALLET_ACCOUNT },
    transactions: [...SEED_WALLET_TRANSACTIONS],
  };
}

function readState(): WalletState {
  if (!canUseStorage()) return getDefaultState();
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<WalletState>;
    return {
      account: parsed.account ?? { ...SEED_WALLET_ACCOUNT },
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [...SEED_WALLET_TRANSACTIONS],
    };
  } catch {
    return getDefaultState();
  }
}

function writeState(state: WalletState) {
  if (!canUseStorage()) return;
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(state));
  emit();
}

export function getWalletAccount(): WalletAccount {
  return readState().account;
}

export function getWalletTransactions(): WalletTransaction[] {
  return [...readState().transactions].sort((a, b) => b.id.localeCompare(a.id));
}

export function getWalletSummary() {
  const account = getWalletAccount();
  const txs = getWalletTransactions();
  const inflow = txs
    .filter((t) => t.direction === "in" && t.status === "success")
    .reduce((s, t) => s + t.amountToman, 0);
  const outflow = txs
    .filter((t) => t.direction === "out" && (t.status === "success" || t.status === "processing"))
    .reduce((s, t) => s + t.amountToman, 0);
  return {
    account,
    availableToman: account.balanceToman,
    pendingToman: account.pendingToman,
    totalInToman: inflow,
    totalOutToman: outflow,
    txCount: txs.length,
  };
}

export function depositToWallet(amountToman: number, note?: string): WalletTransaction {
  const amount = Math.round(amountToman);
  if (!Number.isFinite(amount) || amount < 100_000) {
    throw new Error("حداقل مبلغ شارژ ۱۰۰٬۰۰۰ تومان است.");
  }
  if (amount > 50_000_000) {
    throw new Error("حداکثر شارژ در هر تراکنش ۵۰ میلیون تومان است.");
  }

  const state = readState();
  const tx: WalletTransaction = {
    id: createTxId(),
    title: "شارژ کیف پول",
    amountToman: amount,
    date: formatWalletDate(),
    direction: "in",
    kind: "deposit",
    status: "success",
    reference: createReference(),
    note: note?.trim() || "شارژ از درگاه بانکی (شبیه‌سازی)",
  };

  state.account = {
    ...state.account,
    balanceToman: state.account.balanceToman + amount,
    lastUpdatedAt: formatWalletDate(),
  };
  state.transactions = [tx, ...state.transactions];
  writeState(state);
  return tx;
}

export function withdrawFromWallet(
  amountToman: number,
  options?: { bankLast4?: string; note?: string },
): WalletTransaction {
  const amount = Math.round(amountToman);
  if (!Number.isFinite(amount) || amount < 100_000) {
    throw new Error("حداقل مبلغ برداشت ۱۰۰٬۰۰۰ تومان است.");
  }

  const state = readState();
  if (amount > state.account.balanceToman) {
    throw new Error("موجودی قابل برداشت کافی نیست.");
  }

  const tx: WalletTransaction = {
    id: createTxId(),
    title: "برداشت به حساب بانکی",
    amountToman: amount,
    date: formatWalletDate(),
    direction: "out",
    kind: "withdraw",
    status: "processing",
    reference: createReference(),
    bankLast4: options?.bankLast4 ?? "۴۲۱۸",
    note: options?.note?.trim() || "در صف واریز به شبا پیش‌فرض",
  };

  state.account = {
    ...state.account,
    balanceToman: state.account.balanceToman - amount,
    lastUpdatedAt: formatWalletDate(),
  };
  state.transactions = [tx, ...state.transactions];
  writeState(state);
  return tx;
}

export function resetWallet() {
  if (!canUseStorage()) return;
  localStorage.removeItem(WALLET_STORAGE_KEY);
  emit();
}

export function subscribeWallet(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(WALLET_UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(WALLET_UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export { formatToman, parsePersianAmount };
