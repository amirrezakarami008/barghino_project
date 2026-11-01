"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Button } from "./button";
import { Modal } from "./modal";
import type { AlertVariant } from "./alert-types";
import "./alert.css";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  confirmDisabled?: boolean;
  /** @deprecated Prefer `variant="danger"`. */
  tone?: "primary" | "danger";
  variant?: Extract<AlertVariant, "info" | "success" | "warning" | "danger">;
  consequences?: string[];
  children?: ReactNode;
};

const variantIcon: Record<NonNullable<ConfirmDialogProps["variant"]>, IconName> = {
  info: "shield",
  success: "check",
  warning: "clock",
  danger: "close",
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  pending = false,
  confirmDisabled = false,
  tone = "primary",
  variant,
  consequences,
  children,
}: ConfirmDialogProps) {
  const resolved: NonNullable<ConfirmDialogProps["variant"]> =
    variant ?? (tone === "danger" ? "danger" : "info");
  const isDestructive = resolved === "danger";
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, pending]);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!pending) onClose();
      }}
      title={title}
      description={description}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" disabled={pending} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={isDestructive ? "danger" : "primary"}
            disabled={pending || confirmDisabled}
            onClick={onConfirm}
          >
            {pending ? "در حال انجام…" : confirmLabel}
          </Button>
        </div>
      }
    >
      <div ref={panelRef} aria-labelledby={titleId}>
        <div className="ui-confirm-header">
          <span className={`ui-confirm-header__icon ui-confirm-header__icon--${resolved}`} aria-hidden>
            <Icon name={variantIcon[resolved]} className="size-5" />
          </span>
          <div className="min-w-0">
            <p id={titleId} className="sr-only">
              {title}
            </p>
            {children}
            {consequences && consequences.length > 0 ? (
              <ul className="ui-confirm-consequences">
                {consequences.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
}
