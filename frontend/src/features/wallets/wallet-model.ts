import type { StatusTone } from "@/components/ui";
import { faNumber } from "@/shared/lib/fa";
import type { TransactionKind, WalletStatus } from "./wallets-api";

export function formatToman(amount: number): string {
  return faNumber(amount, { maximumFractionDigits: 0 });
}

export function walletStatusMeta(status: WalletStatus): {
  readonly tone: StatusTone;
  readonly label: string;
  readonly hint: string;
} {
  if (status === "active") {
    return {
      tone: "approved",
      label: "فعال",
      hint: "آمادهٔ دریافت و انتقال وجه",
    };
  }
  if (status === "frozen") {
    return {
      tone: "pending",
      label: "مسدود موقت",
      hint: "حرکت وجه جدید تا رفع مسدودی ممکن نیست",
    };
  }
  return {
    tone: "rejected",
    label: "غیرفعال",
    hint: "این کیف پول برای همیشه بسته شده است",
  };
}

export function transactionKindMeta(kind: TransactionKind): {
  readonly label: string;
  readonly tone: "in" | "out" | "neutral";
} {
  switch (kind) {
    case "deposit":
      return { label: "واریز", tone: "in" };
    case "withdrawal":
      return { label: "برداشت", tone: "out" };
    case "transfer":
      return { label: "انتقال", tone: "neutral" };
    case "refund":
      return { label: "برگشت", tone: "in" };
    case "reversal":
      return { label: "ابطال", tone: "neutral" };
    case "adjustment":
      return { label: "اصلاح", tone: "neutral" };
  }
}

export function localDateTime(value: string): string {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "ثبت نشده";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function shortUuid(value: string): string {
  return value.replace(/-/g, "").slice(0, 8);
}

export function directionForWallet(
  kind: TransactionKind,
  walletUuid: string,
  sourceUuid: string | null,
  destinationUuid: string | null,
): "in" | "out" | "neutral" {
  if (kind === "deposit" || kind === "refund") return "in";
  if (kind === "withdrawal") return "out";
  if (kind === "transfer") {
    if (destinationUuid === walletUuid) return "in";
    if (sourceUuid === walletUuid) return "out";
  }
  if (kind === "adjustment") {
    if (destinationUuid === walletUuid) return "in";
    if (sourceUuid === walletUuid) return "out";
  }
  return "neutral";
}

export const KIND_FILTERS = [
  { value: "all", label: "همه" },
  { value: "deposit", label: "واریز" },
  { value: "withdrawal", label: "برداشت" },
  { value: "transfer", label: "انتقال" },
  { value: "refund", label: "برگشت" },
  { value: "reversal", label: "ابطال" },
  { value: "adjustment", label: "اصلاح" },
] as const;

export type KindFilter = (typeof KIND_FILTERS)[number]["value"];
