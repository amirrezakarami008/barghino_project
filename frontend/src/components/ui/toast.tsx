"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { Button } from "./button";

const toastVariants = cva(
  "pointer-events-auto flex w-[min(100%,22rem)] items-start gap-3 rounded-lg border px-4 py-3 shadow-lifted",
  {
    variants: {
      tone: {
        info: "border-volt-200 bg-info text-info-foreground",
        success: "border-status-approved-border bg-status-approved-bg text-status-approved",
        warning: "border-status-pending-border bg-status-pending-bg text-status-pending",
        danger: "border-status-rejected-border bg-status-rejected-bg text-status-rejected",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  },
);

export type ToastTone = NonNullable<VariantProps<typeof toastVariants>["tone"]>;

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  push: (toast: Omit<ToastItem, "id"> & { id?: string }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, "id"> & { id?: string }) => {
      const id = toast.id ?? `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setItems((prev) => [...prev, { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {items.map((item) => (
          <Toast key={item.id} {...item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext>
  );
}

export type ToastProps = ToastItem & {
  onDismiss?: () => void;
  className?: string;
};

export function Toast({ title, description, tone = "info", onDismiss, className }: ToastProps) {
  return (
    <div className={cn(toastVariants({ tone }), className)} role="status">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="text-caption opacity-90">{description}</p> : null}
      </div>
      {onDismiss ? (
        <Button variant="ghost" size="icon" className="size-9 min-h-9" onClick={onDismiss} aria-label="بستن">
          <Icon name="close" className="size-4" />
          بستن
        </Button>
      ) : null}
    </div>
  );
}
