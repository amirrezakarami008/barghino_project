import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";

const alertVariants = cva(
  "flex gap-3 rounded-md border px-4 py-3 text-sm shadow-soft",
  {
    variants: {
      tone: {
        info: "border-volt-200 bg-info text-info-foreground",
        warning: "border-status-pending-border bg-status-pending-bg text-status-pending",
        success: "border-status-approved-border bg-status-approved-bg text-status-approved",
        danger: "border-status-rejected-border bg-status-rejected-bg text-status-rejected",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  },
);

const toneIcon: Record<NonNullable<VariantProps<typeof alertVariants>["tone"]>, IconName> = {
  info: "bell",
  warning: "clock",
  success: "check",
  danger: "close",
};

export type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    title?: string;
    action?: ReactNode;
  };

export function Alert({ className, tone = "info", title, action, children, ...props }: AlertProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <Icon name={toneIcon[tone ?? "info"]} className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="opacity-95">{children}</div> : null}
        {action}
      </div>
    </div>
  );
}

export { alertVariants };
