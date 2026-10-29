"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactElement } from "react";
import { Icon } from "@/shared/ui/icon";
import { cx } from "@/shared/lib/cx";
import { isNavActive, type NavItem } from "./site-nav";
import { WorkspaceAccount } from "./workspace-account";
import { WorkspaceBrand } from "./workspace-brand";
import type { WorkspaceAccountDetails, WorkspaceKind } from "./workspace-types";

type WorkspaceSidebarProps = {
  readonly kind: WorkspaceKind;
  readonly items: readonly NavItem[];
  readonly pathname: string;
  readonly account: WorkspaceAccountDetails;
  readonly onSignOut: () => Promise<void>;
  readonly onNavigate?: () => void;
};

export function WorkspaceSidebar({ kind, items, pathname, account, onSignOut, onNavigate }: WorkspaceSidebarProps): ReactElement {
  const navigationRef = useRef<HTMLElement>(null);
  const home = kind === "admin" ? "/admin" : "/panel";
  const accountPaths = [`${home}/profile`, `${home}/settings`, `${home}/support`];
  const groups = [
    { id: "workspace", items: items.filter((item) => !accountPaths.includes(item.href)) },
    { id: "account", items: items.filter((item) => accountPaths.includes(item.href)) },
  ];
  const navigation = groups.map((group) => (
    <div key={group.id} className="workspace-navigation-group">
      {kind === "admin" ? <p className="admin-navigation-label">{group.id === "workspace" ? "مدیریت عملیات" : "حساب کاربری"}</p> : null}
      {group.items.map((item) => item.disabled ? (
        <span key={item.href} aria-disabled="true" title="این بخش به‌زودی فعال می‌شود" className="workspace-nav-link is-disabled">
          {item.icon ? <Icon name={item.icon} /> : null}<span>{item.label}</span><Icon name="lock" />
        </span>
      ) : (
        <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={isNavActive(pathname, item) ? "page" : undefined} className={cx("workspace-nav-link", isNavActive(pathname, item) && "is-active")}>
          {item.icon ? <Icon name={item.icon} /> : null}<span>{item.label}</span>
        </Link>
      ))}
    </div>
  ));

  useEffect(() => {
    const activeLink = navigationRef.current?.querySelector<HTMLAnchorElement>('[aria-current="page"]');
    if (activeLink && activeLink.getClientRects().length > 0) activeLink.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  return (
    <div className="workspace-sidebar-body">
      <WorkspaceBrand href={home} caption={kind === "admin" ? "مدیریت برقینو" : "انرژیِ خانهٔ شما"} onNavigate={onNavigate} />
      <nav ref={navigationRef} aria-label={kind === "admin" ? "منوی مدیر" : "منوی پنل"} className="workspace-navigation">{navigation}</nav>
      <div className="workspace-sidebar-footer">
        {kind === "admin" ? null : <Link href="/contact" className="workspace-support-link" onClick={onNavigate}><Icon name="headset" />تماس با برقینو</Link>}
        <div className="workspace-session-status"><span className="workspace-session-dot" aria-hidden="true" /><span>{kind === "admin" ? "دسترسی مدیریت" : "نشست فعال"}</span><small>{kind === "admin" ? "ورود با حساب تأییدشده" : account.label}</small></div>
        <WorkspaceAccount account={account} profileHref={`${home}/profile`} onSignOut={onSignOut} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
