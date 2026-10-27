"use client";

import { useEffect, useEffectEvent, useId, useRef, type ReactElement, type ReactNode } from "react";
import { Icon } from "@/shared/ui/icon";

type WorkspaceDrawerProps = {
  readonly children: ReactNode;
  readonly onClose: () => void;
};

export function WorkspaceDrawer({ children, onClose }: WorkspaceDrawerProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closeOnDesktop = useEffectEvent(() => onClose());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const handleResize = (event: MediaQueryListEvent) => {
      if (event.matches) closeOnDesktop();
    };
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>("button")?.focus();
    dialog.querySelector<HTMLAnchorElement>('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
    document.body.style.overflow = "hidden";
    desktop.addEventListener("change", handleResize);
    return () => {
      desktop.removeEventListener("change", handleResize);
      document.body.style.overflow = previousOverflow;
      dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      id="workspace-mobile-navigation"
      className="workspace-mobile-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'))
          .filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <h2 id={titleId} className="sr-only">منوی فضای کار</h2>
      <div className="workspace-glass workspace-drawer-surface">
        <button type="button" className="workspace-icon-button workspace-drawer-close" aria-label="بستن منو" onClick={onClose}><Icon name="close" /></button>
        {children}
      </div>
    </dialog>
  );
}
