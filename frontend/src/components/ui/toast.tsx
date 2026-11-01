"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/shared/lib/cn";
import { Alert } from "./alert";
import { isAutoDismissAllowed } from "./alert-logic";
import type { AlertAction, AlertVariant } from "./alert-types";
import "./alert.css";

const MAX_TOASTS = 3;
const DEFAULT_TTL_MS = 5000;
const EXIT_MS = 220;

export type ToastTone = AlertVariant;

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  variant?: AlertVariant;
  action?: AlertAction;
  durationMs?: number;
};

type ToastContextValue = {
  push: (toast: Omit<ToastItem, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx;
}

export function ToastProvider({
  children,
  mobileOffsetClassName,
}: {
  children: ReactNode;
  /** Extra class for sticky mobile action bars offset. */
  mobileOffsetClassName?: string;
}) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((toast: Omit<ToastItem, "id"> & { id?: string }) => {
    const id = toast.id ?? `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setItems((prev) => {
      const next = [...prev.filter((item) => item.id !== id), { ...toast, id }];
      return next.slice(-MAX_TOASTS);
    });
    return id;
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        className={cn("ui-toast-stack", mobileOffsetClassName)}
        style={{ ["--toast-mobile-offset" as string]: "4.5rem" } as CSSProperties}
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

export function Toast({
  id,
  title,
  description,
  tone = "info",
  variant,
  action,
  durationMs = DEFAULT_TTL_MS,
  onDismiss,
  className,
}: ToastProps) {
  const resolved = variant ?? tone ?? "info";
  const [open, setOpen] = useState(true);
  const paused = useRef(false);
  const remaining = useRef(durationMs);
  const started = useRef(0);
  const timer = useRef<number | null>(null);
  const actions = action ? [action] : undefined;
  const canAutoDismiss = isAutoDismissAllowed(resolved, Boolean(action));

  const clearTimer = () => {
    if (timer.current != null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const requestClose = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => onDismiss?.(), EXIT_MS);
  }, [onDismiss]);

  const armTimer = useCallback(() => {
    if (!canAutoDismiss) return;
    clearTimer();
    started.current = Date.now();
    timer.current = window.setTimeout(() => {
      requestClose();
    }, remaining.current);
  }, [canAutoDismiss, requestClose]);

  useEffect(() => {
    armTimer();
    return clearTimer;
  }, [armTimer]);

  function pause() {
    if (!canAutoDismiss || paused.current) return;
    paused.current = true;
    remaining.current = Math.max(0, remaining.current - (Date.now() - started.current));
    clearTimer();
  }

  function resume() {
    if (!canAutoDismiss || !paused.current) return;
    paused.current = false;
    armTimer();
  }

  return (
    <div
      className={cn("ui-toast", className)}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resume();
      }}
    >
      <Alert
        variant={resolved}
        title={title}
        description={description}
        actions={actions}
        dismissible
        open={open}
        onDismiss={requestClose}
        compact
        data-toast-id={id}
      />
    </div>
  );
}
