"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactElement } from "react";
import { adminNav, isNavActive } from "@/shared/layout/site-nav";
import { useWorkspaceTheme } from "@/shared/layout/use-workspace-theme";
import { WorkspaceDrawer } from "@/shared/layout/workspace-drawer";
import type { WorkspaceShellProps } from "@/shared/layout/workspace-types";
import { Icon } from "@/shared/ui/icon";
import { AdminNavigation } from "./admin-navigation";
import "./admin.css";
import "./admin-vibrant.css";

type AdminShellProps = Omit<WorkspaceShellProps, "kind">;

export function AdminShell({ theme: initialTheme = "dark", account, onSignOut, children }: AdminShellProps): ReactElement {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string>();
  const { theme, toggleTheme } = useWorkspaceTheme(initialTheme, "barghino-admin-theme");
  const current = adminNav.find((item) => isNavActive(pathname, item));
  const isOpen = menuPath === pathname;
  function closeMenu(): void { setMenuPath(undefined); }
  const navigation = <AdminNavigation account={account} pathname={pathname} onSignOut={onSignOut} onNavigate={closeMenu} />;

  return (
    <div className={`admin-shell${theme === "dark" ? " dark" : ""}`} data-theme={theme}>
      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="سایدبار مدیریت">{navigation}</aside>
        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-crumb">
              <button type="button" className="admin-icon-button admin-mobile-menu" aria-label="باز کردن منو" aria-expanded={isOpen} aria-controls={isOpen ? "workspace-mobile-navigation" : undefined} onClick={() => setMenuPath(pathname)}><Icon name="menu" /></button>
              <Link href="/admin">پنل ادمین</Link><Icon name="chevron" /><strong>{current?.label ?? "مدیریت"}</strong>
            </div>
            <div className="admin-top-actions">
              <Link href="/" className="admin-site-link"><Icon name="home" /><span>وب‌سایت برقینو</span></Link>
              <span className="admin-top-separator" aria-hidden="true" />
              <button type="button" className="admin-icon-button" onClick={toggleTheme} aria-pressed={theme === "dark"} aria-label={theme === "dark" ? "روشن کردن پوسته" : "تاریک کردن پوسته"}><Icon name={theme === "dark" ? "sun" : "moon"} /></button>
              <Link href="/admin/profile" className="admin-icon-button" aria-label="حساب مدیر"><Icon name="user" /></Link>
            </div>
          </header>
          <main id="content" tabIndex={-1} className="admin-content">{children}</main>
        </div>
      </div>
      {isOpen ? <WorkspaceDrawer onClose={closeMenu}>{navigation}</WorkspaceDrawer> : null}
    </div>
  );
}
