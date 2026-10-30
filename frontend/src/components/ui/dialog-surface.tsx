import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { Button } from "./button";

export type DialogSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  titleId?: string;
  description?: string;
  onClose?: () => void;
  footer?: ReactNode;
};

export function DialogSurface({
  title,
  titleId,
  description,
  onClose,
  footer,
  className,
  children,
  ...props
}: DialogSurfaceProps) {
  return (
    <div
      className={cn(
        "glass-strong flex max-h-[min(90dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border shadow-lifted",
        className,
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="space-y-1">
          <h2 id={titleId} className="text-h4">
            {title}
          </h2>
          {description ? <p className="text-sm text-foreground-muted">{description}</p> : null}
        </div>
        {onClose ? (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="بستن">
            <Icon name="close" className="size-5" />
            بستن
          </Button>
        ) : null}
      </header>
      <div className="overflow-y-auto px-5 py-4">{children}</div>
      {footer ? <footer className="border-t border-border px-5 py-4">{footer}</footer> : null}
    </div>
  );
}
