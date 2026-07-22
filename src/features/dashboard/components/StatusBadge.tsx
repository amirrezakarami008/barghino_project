import { cn } from "@/shared/lib/utils";

type StatusVariant =
  | "active"
  | "pending"
  | "inactive"
  | "paid"
  | "overdue"
  | "expired"
  | "draft"
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "success"
  | "failed"
  | "warning"
  | "info"
  | "billing";

const variantStyles: Record<StatusVariant, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  overdue: "bg-red-50 text-red-700 ring-red-600/20",
  expired: "bg-slate-100 text-slate-600 ring-slate-500/20",
  draft: "bg-violet-50 text-violet-700 ring-violet-600/20",
  open: "bg-blue-50 text-blue-700 ring-blue-600/20",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-600/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  billing: "bg-brand-50 text-brand-700 ring-brand-600/20",
};

const statusLabels: Record<StatusVariant, string> = {
  active: "فعال",
  pending: "در انتظار",
  inactive: "غیرفعال",
  paid: "پرداخت‌شده",
  overdue: "سررسید گذشته",
  expired: "منقضی",
  draft: "پیش‌نویس",
  open: "باز",
  in_progress: "در حال بررسی",
  resolved: "حل‌شده",
  closed: "بسته",
  success: "موفق",
  failed: "ناموفق",
  warning: "هشدار",
  info: "اطلاع",
  billing: "مالی",
};

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        variantStyles[status],
        className,
      )}
    >
      {label ?? statusLabels[status]}
    </span>
  );
}
