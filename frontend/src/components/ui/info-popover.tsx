"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import "./alert.css";

export type InfoPopoverProps = {
  title?: string;
  children: ReactNode;
  label?: string;
  className?: string;
};

/** Conceptual “i” tip that replaces permanent explanatory paragraphs. */
export function InfoPopover({
  title,
  children,
  label = "توضیح بیشتر",
  className,
}: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className={cn("ui-info-popover", className)}>
      <button
        type="button"
        className="ui-info-popover__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        i
      </button>
      {open ? (
        <span
          id={panelId}
          role="dialog"
          aria-label={title ?? label}
          className="ui-info-popover__panel"
        >
          {title ? <p className="ui-info-popover__panel-title">{title}</p> : null}
          <div>{children}</div>
        </span>
      ) : null}
    </span>
  );
}
