"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { adminNav, isNavActive, userNav, type NavItem } from "@/shared/layout/site-nav";
import { cx } from "@/shared/lib/cx";
import { Icon } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";

export function WorkspaceShell({
  kind,
  children,
}: {
  kind: "user" | "admin";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const items = kind === "admin" ? adminNav : userNav;
  const current = items.find((item) => isNavActive(pathname, item)) ?? items[0];
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[17.5rem_1fr]">
      <aside className="hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:px-4 lg:py-6">
        <SidebarBody kind={kind} items={items} pathname={pathname} />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <button
            type="button"
            className="grid size-11 cursor-pointer place-items-center rounded-2xl border border-border text-primary lg:hidden"
            aria-expanded={open}
            aria-controls="workspace-nav"
            onClick={() => setOpenPath(pathname)}
          >
            <span className="sr-only">باز کردن منو</span>
            <Icon name="menu" className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{kind === "admin" ? "پنل مدیر" : "پنل خانگی"}</p>
            <h1 className="truncate text-lg font-semibold">{current.label}</h1>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <Link href="/panel/notifications" className="grid size-11 place-items-center rounded-2xl text-primary hover:bg-mint" aria-label="اعلان‌ها">
              <Icon name="bell" className="size-5" />
            </Link>
            <Link href={kind === "admin" ? "/admin" : "/panel/profile"} className="grid size-11 place-items-center rounded-2xl bg-mint text-primary" aria-label="حساب">
              <Icon name="user" className="size-5" />
            </Link>
          </div>
        </header>
        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 cursor-pointer bg-foreground/40" aria-label="بستن منو" onClick={() => setOpenPath(null)} />
            <div id="workspace-nav" className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col bg-sidebar px-4 py-6 text-sidebar-foreground">
              <SidebarBody kind={kind} items={items} pathname={pathname} onNavigate={() => setOpenPath(null)} />
            </div>
          </div>
        ) : null}
        <div id="content" className="px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarBody({
  kind,
  items,
  pathname,
  onNavigate,
}: {
  kind: "user" | "admin";
  items: readonly NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Logo href={kind === "admin" ? "/admin" : "/panel"} tone="inverse" />
      <p className="mt-6 px-2 text-xs text-sidebar-muted">{kind === "admin" ? "مدیریت" : "حساب من"}</p>
      <nav aria-label={kind === "admin" ? "منوی مدیر" : "منوی پنل"} className="mt-2 grid gap-1">
        {items.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm",
                active ? "bg-white/12 font-semibold text-white" : "text-sidebar-muted hover:bg-white/8 hover:text-white",
              )}
            >
              {item.icon ? <Icon name={item.icon} className="size-5 shrink-0" /> : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link href="/" onClick={onNavigate} className="mt-auto inline-flex min-h-11 items-center px-3 text-sm text-sidebar-muted hover:text-white">
        بازگشت به سایت
      </Link>
    </>
  );
}
