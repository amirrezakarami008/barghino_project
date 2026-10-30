"use client";

import type { ReactElement, ReactNode } from "react";
import { AppShell } from "@/features/panel/panel-shell";
import { adminNav } from "@/shared/layout/site-nav";
import type { WorkspaceAccountDetails } from "@/shared/layout/workspace-types";
import "./admin.css";

const adminPrimaryHrefs = ["/admin", "/admin/reviews", "/admin/plans", "/admin/plants"] as const;

type AdminShellProps = {
  account: WorkspaceAccountDetails;
  onSignOut: () => Promise<void>;
  children: ReactNode;
};

export function AdminShell({ account, onSignOut, children }: AdminShellProps): ReactElement {
  return (
    <AppShell
      account={account}
      onSignOut={onSignOut}
      items={adminNav}
      primaryHrefs={adminPrimaryHrefs}
      homeHref="/admin"
      profileHref="/admin/profile"
      density="dense"
      secondaryLabel="سایر"
    >
      {children}
    </AppShell>
  );
}
