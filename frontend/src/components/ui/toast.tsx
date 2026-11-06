"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/cn";
import { Alert } from "./alert";
import { isAutoDismissAllowed } from "./alert-logic";
import type { AlertAction, AlertVariant } from "./alert-types";
import "./alert.css";

const MAX_TOASTS = 3;
const DEFAULT_TTL_MS = 5000;
const EXIT_MS = 220;
const subscribeToClient = () => () => {};

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

export function useToast(): ToastContextValue {
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
}): ReactElement {
  const [items, setItems] = useState<(ToastItem & { instanceKey: number })[]>([]);
  const sequence = useRef(0);
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((toast: Omit<ToastItem, "id"> & { id?: string }) => {
    const instanceKey = ++sequence.current;
    const id = toast.id ?? `toast-${instanceKey}`;
    setItems((prev) => {
      const next = [...prev.filter((item) => item.id !== id), { ...toast, id, instanceKey }];
      return next.slice(-MAX_TOASTS);
    });
    return id;
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      {isClient ? createPortal(
        <div
          className={cn("ui-toast-stack", mobileOffsetClassName)}
          role="region"
          aria-label="پیام‌های سامانه"
        >
          {items.map((item) => (
            <Toast key={item.instanceKey} {...item} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      ) : null}
    </ToastContext>
  );
}

export type ToastProps = ToastItem & {
  onDismiss?: (id: string) => void;
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
}: ToastProps): ReactElement {
  const resolved = variant ?? tone ?? "info";
  const [open, setOpen] = useState(true);
  const paused = useRef(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  const remaining = useRef(durationMs);
  const started = useRef(0);
  const timer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const closing = useRef(false);
  const actions = action ? [action] : undefined;
  const canAutoDismiss = isAutoDismissAllowed(resolved, Boolean(action));

  const clearTimer = useCallback(() => {
    if (timer.current != null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    clearTimer();
    setOpen(false);
    closeTimer.current = window.setTimeout(() => onDismiss?.(id), EXIT_MS);
  }, [clearTimer, id, onDismiss]);

  const armTimer = useCallback(() => {
    if (!canAutoDismiss || paused.current || closing.current || durationMs <= 0) return;
    clearTimer();
    started.current = Date.now();
    timer.current = window.setTimeout(() => {
      requestClose();
    }, remaining.current);
  }, [canAutoDismiss, clearTimer, durationMs, requestClose]);

  useEffect(() => {
    armTimer();
    return clearTimer;
  }, [armTimer, clearTimer]);

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  function pause() {
    if (!canAutoDismiss || paused.current) return;
    paused.current = true;
    remaining.current = Math.max(0, remaining.current - (Date.now() - started.current));
    clearTimer();
  }

  function resume() {
    if (!canAutoDismiss || !paused.current || hovered.current || focused.current) return;
    paused.current = false;
    armTimer();
  }

  return (
    <div
      className={cn("ui-toast", className)}
      onMouseEnter={() => {
        hovered.current = true;
        pause();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        resume();
      }}
      onFocusCapture={() => {
        focused.current = true;
        pause();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focused.current = false;
          resume();
        }
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
