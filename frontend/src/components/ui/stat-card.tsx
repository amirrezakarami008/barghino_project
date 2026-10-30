import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { Badge } from "./badge";
import { faNumber } from "@/shared/lib/fa";

const trendVariants = cva("text-caption font-semibold tabular-nums", {
  variants: {
    direction: {
      up: "text-status-approved",
      down: "text-status-rejected",
      flat: "text-foreground-muted",
    },
  },
});

export type StatCardProps = {
  label: string;
  value: ReactNode;
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
  };
  sample?: boolean;
  hint?: string;
  className?: string;
};

export function StatCard({ label, value, trend, sample = false, hint, className }: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-soft",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption text-foreground-muted">{label}</p>
        {sample ? <Badge tone="soft">نمونه</Badge> : null}
      </div>
      <p className="mt-2 text-h2 tabular-nums text-foreground">{value}</p>
      {trend ? (
        <p className={cn("mt-2", trendVariants({ direction: trend.direction }))}>
          {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "●"} {trend.label}
        </p>
      ) : null}
      {hint ? <p className="mt-2 text-caption text-foreground-muted">{hint}</p> : null}
    </article>
  );
}

/** Helper for numeric sample stats with Persian digits. */
export function formatStatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return faNumber(value, options);
}
