"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { Modal } from "./modal";

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
  tone?: "primary" | "danger";
  children?: ReactNode;
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
  children,
}: ConfirmDialogProps) {
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
            variant={tone === "danger" ? "danger" : "primary"}
            disabled={pending || confirmDisabled}
            onClick={onConfirm}
          >
            {pending ? "در حال انجام…" : confirmLabel}
          </Button>
        </div>
      }
    >
      {children}
    </Modal>
  );
}
