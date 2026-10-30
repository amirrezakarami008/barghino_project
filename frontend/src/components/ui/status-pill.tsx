import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { Badge } from "./badge";
import { STATUS_LABELS, type StatusTone } from "./types";

export type StatusPillProps = HTMLAttributes<HTMLSpanElement> & {
  status: StatusTone;
  label?: string;
};

/** One pill per status token — preferred for tables and lists. */
export function StatusPill({ status, label, className, ...props }: StatusPillProps) {
  return (
    <Badge status={status} className={cn("gap-1.5", className)} {...props}>
      <span
        className="size-1.5 rounded-pill bg-current opacity-80"
        aria-hidden
      />
      {label ?? STATUS_LABELS[status]}
    </Badge>
  );
}
