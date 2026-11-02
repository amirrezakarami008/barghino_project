"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/shared/theme";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/cn";
import { isNavActive, userNav, type NavItem } from "@/shared/layout/site-nav";
import type { WorkspaceAccountDetails } from "@/shared/layout/workspace-types";
import "./panel-shell.css";

const userPrimaryHrefs = ["/panel", "/panel/contracts", "/panel/plant", "/panel/profile"] as const;

const navAccent: Partial<Record<IconName, string>> = {
  home: "var(--panel-icon-sun)",
  file: "var(--panel-icon-volt)",
  solarPanel: "var(--panel-icon-mint)",
  user: "var(--panel-icon-sky)",
  chart: "var(--panel-icon-coral)",
  card: "var(--panel-icon-sky)",
  coins: "var(--panel-icon-sun)",
  sun: "var(--panel-icon-sun)",
  bell: "var(--panel-icon-volt)",
  headset: "var(--panel-icon-mint)",
};

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
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }
  const menuId = useId();
  const current = items.find((item) => isNavActive(pathname, item)) ?? items[0];
  const primary = items.filter((item) => primaryHrefs.includes(item.href));
  const secondary = items.filter((item) => !primaryHrefs.includes(item.href));

  return (
    <div
      className={cn("panel-app", density === "dense" && "panel-app--dense")}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className="panel-app-layout">
        <aside className="panel-sidebar" aria-label="منوی پنل">
          <div className="panel-sidebar-brand">
            <Logo href={homeHref} caption={!collapsed} className="min-w-0" />
            <button
              type="button"
              className="panel-collapse"
              aria-pressed={collapsed}
              aria-label={collapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
              onClick={() => setCollapsed((value) => !value)}
            >
              <Icon name="menu" className="size-5" />
            </button>
          </div>

          <nav className="panel-sidebar-nav" aria-label="بخش‌های اصلی">
            <p className="panel-sidebar-group-label text-caption text-foreground-muted">اصلی</p>
            {primary.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
            {secondary.length ? (
              <>
                <p className="panel-sidebar-group-label mt-3 text-caption text-foreground-muted">
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
                      <span className="panel-nav-icon" aria-hidden>
                        {item.icon ? <Icon name={item.icon} className="size-4" /> : null}
                      </span>
                      <span className="panel-nav-label flex-1">{item.label}</span>
                      <Icon name="lock" className="size-3.5 shrink-0 opacity-70" />
                    </Link>
                  ) : (
                    <NavLink key={item.href} item={item} pathname={pathname} />
                  ),
                )}
              </>
            ) : null}
          </nav>

          <div className="panel-sidebar-foot">
            <div className="panel-sidebar-support">
              <span
                className="panel-nav-icon"
                style={{ background: "var(--panel-icon-volt)", color: "#fff" }}
                aria-hidden
              >
                <Icon name="bolt" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">برقینو پنل</p>
                <p className="truncate text-caption text-foreground-muted">{account.label}</p>
              </div>
            </div>
            <p className="panel-sidebar-caption text-caption text-foreground-muted">{account.label}</p>
          </div>
        </aside>

        <div className="panel-main">
          <header className="panel-topbar">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-h4 tracking-tight">{current?.label ?? "پنل"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="hidden sm:inline-flex" />
              <button
                type="button"
                className="grid size-11 place-items-center rounded-pill border border-border bg-card sm:hidden"
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
                  reduceMotion={Boolean(reduceMotion)}
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

          <main id="content" tabIndex={-1} className="panel-content outline-none focus:outline-none">
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
  const accent = item.icon ? navAccent[item.icon] : undefined;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn("panel-nav-link", active && "is-active")}
      title={item.label}
    >
      <span
        className="panel-nav-icon"
        style={active && accent ? { background: accent, color: "#fff" } : undefined}
        aria-hidden
      >
        {item.icon ? <Icon name={item.icon} className="size-4" /> : null}
      </span>
      <span className="panel-nav-label">{item.label}</span>
    </Link>
  );
}

function UserMenuButton({
  account,
  open,
  menuId,
  profileHref,
  reduceMotion,
  onToggle,
  onSignOut,
  onClose,
}: {
  account: WorkspaceAccountDetails;
  open: boolean;
  menuId: string;
  profileHref: string;
  reduceMotion: boolean;
  onToggle: () => void;
  onSignOut: () => Promise<void>;
  onClose: () => void;
}) {
  return (
    <>
      <button type="button" className="panel-user-trigger" aria-expanded={open} aria-controls={menuId} onClick={onToggle}>
        <span className="panel-avatar">{account.initials || "ب"}</span>
        <span className="max-w-[9rem] truncate">{account.name}</span>
        <Icon name="chevron" className="size-4 -rotate-90 opacity-70" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute end-0 top-[calc(100%+0.5rem)] z-40"
          >
            <UserMenuPanel
              id={menuId}
              account={account}
              profileHref={profileHref}
              onSignOut={onSignOut}
              onClose={onClose}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
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
        className="flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-surface"
        onClick={onClose}
      >
        پروفایل
      </Link>
      <Link
        href="/"
        role="menuitem"
        className="flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-surface"
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
