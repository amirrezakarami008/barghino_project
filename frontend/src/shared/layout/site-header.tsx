"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isNavActive, publicNav } from "@/shared/layout/site-nav";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";
import { cx } from "@/shared/lib/cx";

export function SiteHeader() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="صفحات اصلی" className="ms-auto hidden items-center gap-1 lg:flex">
          {publicNav.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "rounded-control px-3 py-2 text-sm transition-colors",
                  active ? "bg-mint font-semibold text-primary" : "text-foreground/80 hover:bg-surface hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ms-auto hidden items-center gap-2 lg:ms-0 lg:flex">
          <ButtonLink href="/login" variant="secondary">
            ورود
          </ButtonLink>
          <ButtonLink href="/register">ثبت‌نام</ButtonLink>
        </div>
        <button
          type="button"
          className="ms-auto grid size-11 cursor-pointer place-items-center rounded-2xl border border-border bg-card text-primary lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          <span className="sr-only">{open ? "بستن منو" : "باز کردن منو"}</span>
          <Icon name={open ? "close" : "menu"} className="size-5" />
        </button>
      </div>
      {open ? (
        <nav id="mobile-nav" aria-label="منوی موبایل" className="border-t border-border bg-card px-4 py-4 lg:hidden">
          <ul className="grid gap-1">
            {publicNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-2xl px-3 py-3 text-sm hover:bg-mint"
                  aria-current={isNavActive(pathname, item) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <ButtonLink href="/login" variant="secondary">
              ورود
            </ButtonLink>
            <ButtonLink href="/register">ثبت‌نام</ButtonLink>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
