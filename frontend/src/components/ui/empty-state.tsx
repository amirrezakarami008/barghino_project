import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: IconName;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon = "file",
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center shadow-soft",
        className,
      )}
      role="status"
    >
      <span className="flex size-14 items-center justify-center rounded-lg bg-grad-sun text-primary-foreground shadow-sun-glow">
        <Icon name={icon} className="size-6" />
      </span>
      <div className="space-y-1">
        <h3 className="text-h4">{title}</h3>
        {description ? <p className="max-w-sm text-sm text-foreground-muted">{description}</p> : null}
        {children}
      </div>
      {action}
    </div>
  );
}
