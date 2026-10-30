"use client";

import { useEffect, useId, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { DialogSurface } from "./dialog-surface";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/45"
        aria-label="بستن پس‌زمینه"
        onClick={onClose}
      />
      <DialogSurface
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        title={title}
        titleId={titleId}
        description={description}
        onClose={onClose}
        footer={footer}
        className={cn("relative z-10", className)}
      >
        {children}
      </DialogSurface>
    </div>
  );
}
