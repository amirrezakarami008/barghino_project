import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { Badge } from "./badge";

export type LockedFeatureProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function LockedFeature({
  title,
  description = "این بخش هنوز آماده نیست و به‌زودی فعال می‌شود.",
  action,
  className,
}: LockedFeatureProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-soft",
        className,
      )}
      aria-disabled="true"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface text-foreground-muted">
          <Icon name="lock" className="size-5" />
        </span>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-h4">{title}</h3>
            <Badge tone="soft">به‌زودی</Badge>
          </div>
          <p className="text-sm text-foreground-muted">{description}</p>
          {action}
        </div>
      </div>
    </div>
  );
}
