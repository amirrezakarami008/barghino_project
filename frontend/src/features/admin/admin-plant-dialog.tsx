"use client";
import { useEffect, useId, useRef, type ReactElement, type ReactNode } from "react";
import { Icon } from "@/shared/ui/icon";
export function AdminPlantDialog({ title, pending, onClose, children }: { readonly title: string; readonly pending: boolean; readonly onClose: () => void; readonly children: ReactNode }): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null), titleId = useId();
  useEffect(() => {
    const element = dialog.current, previous = document.activeElement, overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return <dialog className="admin-plant-dialog" ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}><header><span className="admin-icon-tile admin-tone-emerald"><Icon name="solarPanel" /></span><h2 id={titleId}>{title}</h2><button type="button" className="admin-icon-button" aria-label="بستن پنجره" disabled={pending} onClick={onClose}><Icon name="close" /></button></header>{children}</dialog>;
}
