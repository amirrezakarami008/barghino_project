"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cva } from "class-variance-authority";
import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Button, ButtonLink } from "./button";
import type {
  AlertAction,
  AlertHandle,
  AlertListItem,
  AlertTone,
  AlertVariant,
} from "./alert-types";
import "./alert.css";

/** Compatibility class helper for older call sites. Prefer `ui-alert--*` modifiers. */
export const alertVariants = cva("ui-alert", {
  variants: {
    tone: {
      info: "ui-alert--info",
      warning: "ui-alert--warning",
      success: "ui-alert--success",
      danger: "ui-alert--danger",
    },
  },
  defaultVariants: { tone: "info" },
});

const variantIcon: Record<AlertVariant, IconName> = {
  info: "shield",
  success: "check",
  warning: "clock",
  danger: "close",
  neutral: "bell",
};

const DISMISS_PREFIX = "barqino.alert.dismiss.";

function readDismissed(key: string | undefined): boolean {
  if (!key || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISS_PREFIX + key) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(key: string | undefined) {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISS_PREFIX + key, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  variant?: AlertVariant;
  /** @deprecated Prefer `variant`. */
  tone?: AlertTone;
  title?: string;
  description?: ReactNode;
  items?: AlertListItem[];
  actions?: AlertAction[];
  /** @deprecated Prefer `actions`. */
  action?: ReactNode;
  dismissible?: boolean;
  dismissKey?: string;
  details?: ReactNode;
  detailsLabel?: string;
  icon?: ReactNode;
  compact?: boolean;
  /** Controlled visibility; defaults to mounted. */
  open?: boolean;
  onDismiss?: () => void;
  ref?: Ref<AlertHandle>;
  children?: ReactNode;
};

export function Alert({
  className,
  variant,
  tone,
  title,
  description,
  items,
  actions,
  action,
  dismissible = false,
  dismissKey,
  details,
  detailsLabel = "جزئیات بیشتر",
  icon,
  compact = false,
  open = true,
  onDismiss,
  ref,
  children,
  ...props
}: AlertProps) {
  const resolved: AlertVariant = variant ?? tone ?? "info";
  const body = description ?? children;
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [dismissed, setDismissed] = useState(() => readDismissed(dismissKey));
  const [shake, setShake] = useState(false);
  const visible = open && !dismissed;

  useImperativeHandle(ref, () => ({
    focus: () => {
      rootRef.current?.focus({ preventScroll: false });
    },
  }));

  useEffect(() => {
    if (!visible || resolved !== "danger" || reduceMotion) return;
    setShake(true);
    const timer = window.setTimeout(() => setShake(false), 450);
    return () => window.clearTimeout(timer);
  }, [visible, resolved, reduceMotion]);

  function handleDismiss() {
    setDismissed(true);
    writeDismissed(dismissKey);
    onDismiss?.();
  }

  const transition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="alert"
          initial={reduceMotion ? false : { opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, height: 0 }}
          transition={transition}
          style={{ overflow: "hidden" }}
        >
          <div
            ref={rootRef}
            role={resolved === "danger" ? "alert" : "status"}
            aria-live={resolved === "danger" ? "assertive" : "polite"}
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={cn(
              "ui-alert",
              `ui-alert--${resolved}`,
              compact && "ui-alert--compact",
              shake && "ui-alert--shake",
              className,
            )}
            {...props}
          >
            <span className="ui-alert__icon" aria-hidden>
              {icon ?? <Icon name={variantIcon[resolved]} className="size-4" />}
            </span>
            <div className="ui-alert__body">
              {title ? (
                <p id={titleId} className="ui-alert__title">
                  {title}
                </p>
              ) : null}
              {body ? <div className="ui-alert__description">{body}</div> : null}
              {items && items.length > 0 ? (
                <ul className="ui-alert__list">
                  {items.map((item, index) => (
                    <li key={item.id ?? index}>
                      {item.href ? <a href={item.href}>{item.label}</a> : item.label}
                    </li>
                  ))}
                </ul>
              ) : null}
              {details ? (
                <details className="ui-alert__details">
                  <summary>{detailsLabel}</summary>
                  <div className="ui-alert__details-body">{details}</div>
                </details>
              ) : null}
              {(actions && actions.length > 0) || action ? (
                <div className="ui-alert__actions">
                  {actions?.map((item) => (
                    <AlertActionButton key={item.label} action={item} />
                  ))}
                  {action}
                </div>
              ) : null}
            </div>
            {dismissible ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ui-alert__dismiss size-9 min-h-9"
                onClick={handleDismiss}
                aria-label="بستن هشدار"
              >
                <Icon name="close" className="size-4" />
                بستن
              </Button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AlertActionButton({ action }: { action: AlertAction }) {
  const variant = action.variant ?? "secondary";
  if (action.href) {
    return (
      <ButtonLink href={action.href} variant={variant === "ghost" ? "ghost" : variant} size="sm">
        {action.label}
      </ButtonLink>
    );
  }
  return (
    <Button type="button" variant={variant === "ghost" ? "ghost" : variant} size="sm" onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export { Alert as default };
