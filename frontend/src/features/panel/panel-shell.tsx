"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/shared/theme";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/cn";
import { isNavActive, userNav, type NavItem } from "@/shared/layout/site-nav";
import type { WorkspaceAccountDetails } from "@/shared/layout/workspace-types";
import "./panel-shell.css";

const userPrimaryHrefs = ["/panel", "/panel/contracts", "/panel/plant", "/panel/profile"] as const;

export type AppShellProps = {
  account: WorkspaceAccountDetails;
  onSignOut: () => Promise<void>;
  children: ReactNode;
  items: readonly NavItem[];
  primaryHrefs: readonly string[];
  homeHref: string;
  profileHref: string;
  density?: "default" | "dense";
  secondaryLabel?: string;
};

export function AppShell({
  account,
  onSignOut,
  children,
  items,
  primaryHrefs,
  homeHref,
  profileHref,
  density = "default",
  secondaryLabel = "به‌زودی",
}: AppShellProps): ReactElement {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const current = items.find((item) => isNavActive(pathname, item)) ?? items[0];
  const primary = items.filter((item) => primaryHrefs.includes(item.href));
  const secondary = items.filter((item) => !primaryHrefs.includes(item.href));

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div
      className={cn("panel-app", density === "dense" && "panel-app--dense")}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className="panel-app-layout">
        <aside className="panel-sidebar" aria-label="منوی پنل">
          <div className="flex items-center justify-between gap-2">
            <Logo href={homeHref} caption={!collapsed} className="min-w-0" />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-md border border-border text-foreground-muted hover:bg-surface"
              aria-pressed={collapsed}
              aria-label={collapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
              onClick={() => setCollapsed((value) => !value)}
            >
              <Icon name="menu" className="size-5" />
            </button>
          </div>

          <nav className="panel-sidebar-nav" aria-label="بخش‌های اصلی">
            <p className="panel-sidebar-group-label mb-1 px-2 text-caption text-foreground-muted">اصلی</p>
            {primary.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
            {secondary.length ? (
              <>
                <p className="panel-sidebar-group-label mb-1 mt-4 px-2 text-caption text-foreground-muted">
                  {secondaryLabel}
                </p>
                {secondary.map((item) =>
                  "disabled" in item && item.disabled ? (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="panel-nav-locked"
                      title="این بخش به‌زودی فعال می‌شود"
                      aria-current={isNavActive(pathname, item) ? "page" : undefined}
                    >
                      {item.icon ? <Icon name={item.icon} className="size-5 shrink-0" /> : null}
                      <span className="panel-nav-label flex-1">{item.label}</span>
                      <Icon name="lock" className="size-4 shrink-0" />
                    </Link>
                  ) : (
                    <NavLink key={item.href} item={item} pathname={pathname} />
                  ),
                )}
              </>
            ) : null}
          </nav>

          <p className="panel-sidebar-caption text-caption text-foreground-muted">{account.label}</p>
        </aside>

        <div className="panel-main">
          <header className="panel-topbar glass-strong">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-h4">{current?.label ?? "پنل"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="hidden sm:inline-flex" />
              <button
                type="button"
                className="grid size-11 place-items-center rounded-md border border-border sm:hidden"
                aria-label={menuOpen ? "بستن منوی کاربر" : "منوی کاربر"}
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <Icon name="user" className="size-5" />
              </button>
              <div className="relative hidden sm:block">
                <UserMenuButton
                  account={account}
                  open={menuOpen}
                  menuId={menuId}
                  profileHref={profileHref}
                  onToggle={() => setMenuOpen((value) => !value)}
                  onSignOut={onSignOut}
                  onClose={() => setMenuOpen(false)}
                />
              </div>
            </div>
          </header>

          {menuOpen ? (
            <div className="relative px-4 sm:hidden">
              <UserMenuPanel
                id={menuId}
                account={account}
                profileHref={profileHref}
                onSignOut={onSignOut}
                onClose={() => setMenuOpen(false)}
              />
            </div>
          ) : null}

          <main id="content" tabIndex={-1} className="panel-content">
            {children}
          </main>
        </div>
      </div>

      <nav className="panel-bottom-tabs" aria-label="میانبر موبایل">
        {primary.slice(0, 4).map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("panel-tab", active && "is-active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={(item.icon ?? "home") as IconName} className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

type PanelShellProps = {
  account: WorkspaceAccountDetails;
  onSignOut: () => Promise<void>;
  children: ReactNode;
};

export function PanelShell({ account, onSignOut, children }: PanelShellProps): ReactElement {
  return (
    <AppShell
      account={account}
      onSignOut={onSignOut}
      items={userNav}
      primaryHrefs={userPrimaryHrefs}
      homeHref="/panel"
      profileHref="/panel/profile"
    >
      {children}
    </AppShell>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavActive(pathname, item);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn("panel-nav-link", active && "is-active")}
      title={item.label}
    >
      {item.icon ? <Icon name={item.icon} className="size-5 shrink-0" /> : null}
      <span className="panel-nav-label">{item.label}</span>
    </Link>
  );
}

function UserMenuButton({
  account,
  open,
  menuId,
  profileHref,
  onToggle,
  onSignOut,
  onClose,
}: {
  account: WorkspaceAccountDetails;
  open: boolean;
  menuId: string;
  profileHref: string;
  onToggle: () => void;
  onSignOut: () => Promise<void>;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onToggle}
      >
        <span className="grid size-8 place-items-center rounded-pill bg-grad-sun text-caption text-primary-foreground">
          {account.initials || "ب"}
        </span>
        <span className="max-w-[9rem] truncate">{account.name}</span>
        <Icon name="chevron" className="size-4 -rotate-90" />
      </button>
      {open ? (
        <UserMenuPanel
          id={menuId}
          account={account}
          profileHref={profileHref}
          onSignOut={onSignOut}
          onClose={onClose}
        />
      ) : null}
    </>
  );
}

function UserMenuPanel({
  id,
  account,
  profileHref,
  onSignOut,
  onClose,
}: {
  id: string;
  account: WorkspaceAccountDetails;
  profileHref: string;
  onSignOut: () => Promise<void>;
  onClose: () => void;
}) {
  return (
    <div id={id} className="panel-user-menu" role="menu">
      <p className="px-3 py-2 text-caption text-foreground-muted">{account.label}</p>
      <Link
        href={profileHref}
        role="menuitem"
        className="flex min-h-11 items-center rounded-sm px-3 text-sm hover:bg-surface"
        onClick={onClose}
      >
        پروفایل
      </Link>
      <Link
        href="/"
        role="menuitem"
        className="flex min-h-11 items-center rounded-sm px-3 text-sm hover:bg-surface"
        onClick={onClose}
      >
        وب‌سایت برقینو
      </Link>
      <Button
        variant="ghost"
        className="w-full justify-start"
        role="menuitem"
        onClick={() => {
          onClose();
          void onSignOut();
        }}
      >
        خروج
      </Button>
    </div>
  );
}
