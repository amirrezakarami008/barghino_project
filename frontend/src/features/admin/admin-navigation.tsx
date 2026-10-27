"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { adminNav, isNavActive, type NavItem } from "@/shared/layout/site-nav";
import { WorkspaceAccount } from "@/shared/layout/workspace-account";
import type { WorkspaceAccountDetails } from "@/shared/layout/workspace-types";
import { Icon } from "@/shared/ui/icon";

type AdminNavigationProps = {
  readonly account: WorkspaceAccountDetails;
  readonly pathname: string;
  readonly onSignOut: () => Promise<void>;
  readonly onNavigate: () => void;
};

export function AdminNavigation({ account, pathname, onSignOut, onNavigate }: AdminNavigationProps): ReactElement {
  const items: readonly NavItem[] = adminNav;
  return (
    <div className="admin-sidebar-content">
      <Link href="/admin" className="admin-brand" onClick={onNavigate}><span className="admin-brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><span><strong>برقینو</strong><small>فضای کار مدیریت</small></span></Link>
      <div className="admin-workspace-switch"><span className="admin-workspace-avatar"><Icon name="sun" /></span><div><strong>مدیریت انرژی خورشیدی</strong><small>پنل ادمین</small></div><span className="admin-status-light" aria-hidden="true" /></div>
      <p className="admin-nav-label">فضای کار</p>
      <nav className="admin-navigation" aria-label="منوی مدیر">
        {items.filter((item) => item.href !== "/admin/profile").map((item) => item.disabled ? <span key={item.href} className="admin-nav-disabled" aria-disabled="true" title="این بخش به‌زودی فعال می‌شود"><Icon name={item.icon ?? "file"} /><span>{item.label}</span><Icon name="lock" className="admin-nav-lock" /></span> : <Link key={item.href} href={item.href} className={isNavActive(pathname, item) ? "is-active" : undefined} aria-current={isNavActive(pathname, item) ? "page" : undefined} onClick={onNavigate}><Icon name={item.icon ?? "file"} /><span>{item.label}</span></Link>)}
      </nav>
      <div className="admin-sidebar-note"><span className="admin-note-icon"><Icon name="bolt" /></span><strong>انرژی پاک، همکاری پایدار</strong><p>ابزارهای یکپارچه برای مدیریت فروش برق و مسیر نصب.</p><span className="admin-note-line" aria-hidden="true" /></div>
      <div className="admin-sidebar-bottom"><p className="admin-nav-label">حساب کاربری</p><Link href="/admin/profile" className="admin-profile-link" aria-current={pathname === "/admin/profile" ? "page" : undefined} onClick={onNavigate}><Icon name="user" />پروفایل مدیر</Link><WorkspaceAccount account={account} profileHref="/admin/profile" onSignOut={onSignOut} onNavigate={onNavigate} /></div>
    </div>
  );
}
