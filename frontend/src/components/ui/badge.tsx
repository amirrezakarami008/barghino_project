import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { STATUS_LABELS, type StatusTone } from "./types";

const badgeVariants = cva(
  "inline-flex min-h-8 items-center rounded-pill border px-3 text-caption font-semibold",
  {
    variants: {
      tone: {
        pending: "border-status-pending-border bg-status-pending-bg text-status-pending",
        approved: "border-status-approved-border bg-status-approved-bg text-status-approved",
        rejected: "border-status-rejected-border bg-status-rejected-bg text-status-rejected",
        draft: "border-status-draft-border bg-status-draft-bg text-status-draft",
        active: "border-status-active-border bg-status-active-bg text-status-active",
        closed: "border-status-closed-border bg-status-closed-bg text-status-closed",
        expired: "border-status-expired-border bg-status-expired-bg text-status-expired",
        soft: "border-border bg-surface text-foreground-muted",
        accent: "border-volt-200 bg-volt-50 text-volt-700 dark:border-volt-700 dark:bg-volt-900/40 dark:text-volt-200",
      },
    },
    defaultVariants: {
      tone: "soft",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    status?: StatusTone;
  };

export function Badge({ className, tone, status, children, ...props }: BadgeProps) {
  const resolved = status ?? tone;
  return (
    <span className={cn(badgeVariants({ tone: resolved }), className)} {...props}>
      {children ?? (status ? STATUS_LABELS[status] : null)}
    </span>
  );
}

export { badgeVariants };
