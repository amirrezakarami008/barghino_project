"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactElement } from "react";
import { cx } from "@/shared/lib/cx";
import { Icon } from "@/shared/ui/icon";
import { adminNav, isNavActive, userNav } from "./site-nav";
import { useWorkspaceTheme } from "./use-workspace-theme";
import { WorkspaceDrawer } from "./workspace-drawer";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceSearch } from "./workspace-search";
import type { WorkspaceShellProps } from "./workspace-types";
import "./workspace-shell.css";

export function WorkspaceShell({ kind, theme: initialTheme = "light", account, onSignOut, children }: WorkspaceShellProps): ReactElement {
  const pathname = usePathname();
  const items = kind === "admin" ? adminNav : userNav;
  const current = items.find((item) => isNavActive(pathname, item)) ?? items[0];
  const [openPath, setOpenPath] = useState<string>();
  const { theme, toggleTheme } = useWorkspaceTheme(initialTheme);
  const isMenuOpen = openPath === pathname;
  const isDark = theme === "dark";
  const home = kind === "admin" ? "/admin" : "/panel";

  function closeMenu() {
    setOpenPath(undefined);
  }

  const sidebar = (
    <WorkspaceSidebar kind={kind} items={items} pathname={pathname} account={account} onSignOut={onSignOut} onNavigate={closeMenu} />
  );

  return (
    <div className={cx("workspace-shell panel-canvas", kind === "admin" && "admin-shell", isDark && "dark")} data-theme={theme}>
      <div className="workspace-layout">
        <aside className="workspace-glass workspace-desktop-sidebar" aria-label={kind === "admin" ? "سایدبار مدیریت" : "سایدبار کاربری"}>
          {sidebar}
        </aside>
        <div className="workspace-main">
          <header className="workspace-glass workspace-toolbar">
            <div className="workspace-breadcrumb">
              <button
                type="button"
                className="workspace-icon-button workspace-menu-toggle"
                aria-label="باز کردن منو"
                aria-expanded={isMenuOpen}
                aria-controls={isMenuOpen ? "workspace-mobile-navigation" : undefined}
                onClick={() => setOpenPath(pathname)}
              >
                <Icon name="menu" />
              </button>
              <Link href={home} className="workspace-area-label">{kind === "admin" ? "پنل مدیر" : "فضای کار"}</Link>
              <span className="workspace-breadcrumb-divider" aria-hidden="true">/</span>
              {kind === "admin" ? <p className="workspace-current-page">{current.label}</p> : <h1>{current.label}</h1>}
            </div>
            <div className="workspace-toolbar-actions">
              {kind === "admin" ? <WorkspaceSearch items={items} /> : null}
              <Link href="/" className="workspace-site-link"><Icon name="home" /><span>وب‌سایت برقینو</span></Link>
              <span className="workspace-toolbar-divider" aria-hidden="true" />
              <button type="button" className="workspace-icon-button" aria-pressed={isDark} aria-label={isDark ? "روشن کردن پوسته" : "تاریک کردن پوسته"} title={isDark ? "روشن کردن پوسته" : "تاریک کردن پوسته"} onClick={toggleTheme}>
                <Icon name={isDark ? "sun" : "moon"} />
              </button>
              <Link href={`${home}/profile`} className="workspace-icon-button workspace-toolbar-profile" aria-label="حساب" title="پروفایل حساب"><Icon name="user" /></Link>
            </div>
          </header>
          <main id="content" tabIndex={-1} className="workspace-content">{children}</main>
        </div>
      </div>
      {isMenuOpen ? <WorkspaceDrawer onClose={closeMenu}>{sidebar}</WorkspaceDrawer> : null}
    </div>
  );
}
