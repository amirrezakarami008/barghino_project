"use client";

import { cn } from "@/shared/lib/utils";
import type { Contract } from "../types";
import { requestContractRenewal } from "../lib/store";
import { resolveContractFileBlob } from "../lib/resolveFile";
import { triggerDownload } from "../lib/files";
import {
  Download,
  Eye,
  PenLine,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface ContractRowActionsProps {
  contract: Contract;
}

function IconAction({
  label,
  onClick,
  href,
  disabled,
  tone = "default",
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  tone?: "default" | "brand" | "success" | "amber";
  children: ReactNode;
}) {
  const classes = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1",
    disabled
      ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
      : tone === "brand"
        ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
        : tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : tone === "amber"
            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
  );

  if (href && !disabled) {
    return (
      <Link href={href} title={label} aria-label={label} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}

export function ContractRowActions({ contract }: ContractRowActionsProps) {
  const primaryFile =
    contract.files.find((f) => f.kind === "signed") ??
    contract.files.find((f) => f.kind === "system") ??
    contract.files[0];

  const canDownload =
    Boolean(primaryFile) &&
    (contract.status === "active" ||
      contract.status === "pending" ||
      contract.status === "expired");

  const downloadPrimary = async () => {
    if (!primaryFile) {
      window.alert("فایلی برای دانلود وجود ندارد.");
      return;
    }
    const blob = await resolveContractFileBlob(contract, primaryFile);
    if (!blob) {
      window.alert("فایل در دسترس نیست.");
      return;
    }
    triggerDownload(blob, primaryFile.name);
  };

  const handleRenew = () => {
    if (contract.renewalRequested) {
      window.alert("درخواست تمدید قبلاً ثبت شده است.");
      return;
    }
    if (!window.confirm(`درخواست تمدید «${contract.title}» ثبت شود؟`)) return;
    requestContractRenewal(contract.id);
  };

  return (
    <div className="inline-flex items-center gap-1.5" dir="ltr">
      <IconAction label="جزئیات قرارداد" href={`/dashboard/contracts/${contract.id}`} tone="brand">
        <Eye className="h-4 w-4" />
      </IconAction>

      <IconAction
        label={canDownload ? "دانلود PDF" : "فایل برای دانلود نیست"}
        disabled={!canDownload}
        onClick={() => void downloadPrimary()}
      >
        <Download className="h-4 w-4" />
      </IconAction>

      {contract.status === "draft" ? (
        <IconAction label="تکمیل قرارداد" href="/dashboard/buy" tone="success">
          <ShoppingCart className="h-4 w-4" />
        </IconAction>
      ) : contract.status === "pending" ? (
        <IconAction
          label="بارگذاری نسخه امضا"
          href={`/dashboard/contracts/${contract.id}`}
          tone="amber"
        >
          <PenLine className="h-4 w-4" />
        </IconAction>
      ) : contract.status === "active" || contract.status === "expired" ? (
        <IconAction
          label={contract.renewalRequested ? "تمدید ثبت شده" : "درخواست تمدید"}
          disabled={contract.renewalRequested}
          onClick={handleRenew}
          tone="amber"
        >
          <RefreshCw className="h-4 w-4" />
        </IconAction>
      ) : (
        <span className="inline-flex h-9 w-9" aria-hidden />
      )}
    </div>
  );
}
