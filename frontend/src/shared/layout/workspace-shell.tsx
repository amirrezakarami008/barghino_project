"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/session-provider";
import { adminNav, isNavActive, userNav, type NavItem } from "@/shared/layout/site-nav";
import { cx } from "@/shared/lib/cx";
import { Icon } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";

const themeCookie = "barghino-theme";
let darkLocks = 0;

export function WorkspaceShell({
  kind,
  theme = "light",
  children,
}: {
  kind: "user" | "admin";
  theme?: "light" | "dark";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const items = kind === "admin" ? adminNav : userNav;
  const current = items.find((item) => isNavActive(pathname, item)) ?? items[0];
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [mode, setMode] = useState(theme);
  const open = openPath === pathname;
  const dark = mode === "dark";

  useEffect(() => {
    setMode(theme);
  }, [theme]);

  useEffect(() => {
    if (!dark) return;
    const root = document.documentElement;
    darkLocks += 1;
    root.classList.add("dark");
    return () => {
      darkLocks = Math.max(0, darkLocks - 1);
      if (darkLocks === 0) root.classList.remove("dark");
    };
  }, [dark]);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    setMode(next);
    document.cookie = `${themeCookie}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <div className={cx("panel-canvas min-h-dvh text-foreground lg:grid lg:grid-cols-[19.5rem_1fr]", dark && "dark")}>
      <aside className="hidden p-3 lg:block">
        <div className="liquid-glass sticky top-3 flex h-[calc(100dvh-1.5rem)] flex-col px-3 py-4">
          <SidebarBody kind={kind} items={items} pathname={pathname} />
        </div>
      </aside>
      <div className="min-w-0 lg:py-3 lg:pe-3">
        <header className="liquid-glass sticky top-3 z-30 mx-3 mt-3 flex items-center gap-3 px-3 py-2.5 lg:mx-0 lg:mt-0">
          <button
            type="button"
            className="liquid-glass-control grid size-11 cursor-pointer place-items-center rounded-2xl lg:hidden"
            aria-expanded={open}
            aria-controls="workspace-nav"
            onClick={() => setOpenPath(pathname)}
          >
            <span className="sr-only">باز کردن منو</span>
            <Icon name="menu" className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">{kind === "admin" ? "پنل مدیر" : "پنل خانگی"}</p>
            <h1 className="truncate text-lg font-semibold">{current.label}</h1>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              className="liquid-glass-control grid size-11 cursor-pointer place-items-center rounded-2xl"
              aria-pressed={dark}
              onClick={toggleTheme}
            >
              <span className="sr-only">{dark ? "روشن کردن پوسته" : "تاریک کردن پوسته"}</span>
              <Icon name={dark ? "sun" : "moon"} className="size-5" />
            </button>
            <Link href="/panel/notifications" className="liquid-glass-control grid size-11 place-items-center rounded-2xl" aria-label="اعلان‌ها">
              <Icon name="bell" className="size-5" />
            </Link>
            <Link href={kind === "admin" ? "/admin" : "/panel/profile"} className="liquid-glass-control grid size-11 place-items-center rounded-2xl" aria-label="حساب">
              <Icon name="user" className="size-5" />
            </Link>
          </div>
        </header>
        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 cursor-pointer bg-black/45" aria-label="بستن منو" onClick={() => setOpenPath(null)} />
            <div id="workspace-nav" className="absolute inset-y-3 right-3 flex w-[min(20rem,calc(100vw-1.5rem))]">
              <div className="liquid-glass flex min-h-0 flex-1 flex-col px-3 py-4">
                <SidebarBody kind={kind} items={items} pathname={pathname} onNavigate={() => setOpenPath(null)} />
              </div>
            </div>
          </div>
        ) : null}
        <div id="content" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-1 lg:pt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function SignOutButton({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex min-h-11 cursor-pointer items-center rounded-2xl px-3 text-start text-sm text-foreground hover:bg-white/50 disabled:opacity-60 dark:hover:bg-white/10"
      onClick={() => {
        setPending(true);
        onNavigate?.();
        void signOut().finally(() => setPending(false));
      }}
    >
      {pending ? "در حال خروج…" : "خروج"}
    </button>
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
  const home = kind === "admin" ? "/admin" : "/panel";

  return (
    <>
      <Logo href={home} />
      <p className="mt-6 px-3 text-xs font-medium text-primary">{kind === "admin" ? "مدیریت" : "حساب من"}</p>
      <nav aria-label={kind === "admin" ? "منوی مدیر" : "منوی پنل"} className="mt-2 grid min-h-0 flex-1 content-start gap-1 overflow-y-auto">
        {items.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex min-h-11 items-center gap-3 rounded-2xl px-2.5 text-sm transition-colors duration-200",
                active ? "liquid-glass-pill font-semibold text-primary" : "text-foreground hover:bg-white/50 dark:hover:bg-white/10",
              )}
            >
              {item.icon ? (
                <span
                  className={cx(
                    "grid size-8 shrink-0 place-items-center rounded-xl",
                    active ? "bg-primary text-primary-foreground" : "bg-white/55 text-primary dark:bg-white/10 dark:text-foreground",
                  )}
                >
                  <Icon name={item.icon} className="size-5" />
                </span>
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-3 grid shrink-0 border-t border-white/70 pt-3 dark:border-white/15">
        <SignOutButton onNavigate={onNavigate} />
        <Link
          href="/"
          onClick={onNavigate}
          className="inline-flex min-h-11 items-center rounded-2xl px-3 text-sm text-foreground hover:bg-white/50 dark:hover:bg-white/10"
        >
          بازگشت به سایت
        </Link>
      </div>
    </>
  );
}
