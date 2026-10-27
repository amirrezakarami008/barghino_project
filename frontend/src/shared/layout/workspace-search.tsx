"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactElement } from "react";
import { Icon } from "@/shared/ui/icon";
import type { NavItem } from "./site-nav";

export function WorkspaceSearch({ items }: { readonly items: readonly NavItem[] }): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="admin-search-trigger" onClick={() => setIsOpen(true)} aria-label="جست‌وجوی بخش‌های مدیریت" aria-haspopup="dialog">
        <Icon name="search" /><span>جست‌وجوی بخش‌ها</span>
      </button>
      {isOpen ? <SearchDialog items={items} onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}

function SearchDialog({ items, onClose }: { readonly items: readonly NavItem[]; readonly onClose: () => void }): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizePersian(query);
  const results = items.filter((item) => !item.disabled && normalizePersian(`${item.label} ${item.summary ?? ""}`).includes(normalizedQuery));
  const links = results.map((item) => (
    <Link key={item.href} href={item.href} onClick={onClose} className="admin-search-result">
      <span className="admin-icon-tile"><Icon name={item.icon ?? "file"} /></span>
      <span><strong>{item.label}</strong><small>{item.summary}</small></span>
      <Icon name="chevron" />
    </Link>
  ));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    dialog.showModal();
    inputRef.current?.focus();
    return () => {
      dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="admin-search-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="admin-search-dialog-body">
        <div className="admin-section-heading"><h2 id={titleId}>کدام بخش را می‌خواهید؟</h2><button type="button" className="workspace-icon-button" onClick={onClose} aria-label="بستن جست‌وجو"><Icon name="close" /></button></div>
        <label className="admin-search-field"><Icon name="search" /><input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام بخش یا کاری که می‌خواهید انجام دهید…" aria-label="جست‌وجو در بخش‌های مدیریت" /></label>
        <div className="admin-search-results" aria-live="polite">{links.length ? links : <p className="admin-search-no-results">بخشی پیدا نشد. عبارت کوتاه‌تری جست‌وجو کنید.</p>}</div>
      </div>
    </dialog>
  );
}

function normalizePersian(value: string): string {
  return value.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\u200c\u064b-\u065f]/g, "").trim().toLocaleLowerCase("fa");
}
