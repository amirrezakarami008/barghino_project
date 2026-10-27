"use client";

import type { ReactElement, ReactNode } from "react";
import { useAuth } from "@/features/auth/session-provider";
import { formatIranMobile } from "@/features/auth/lib/phone";
import { WorkspaceShell } from "@/shared/layout/workspace-shell";
import type { WorkspaceKind, WorkspaceTheme } from "@/shared/layout/workspace-types";

type WorkspaceFrameProps = {
  readonly kind: WorkspaceKind;
  readonly theme: WorkspaceTheme;
  readonly children: ReactNode;
};

export function WorkspaceFrame({ kind, theme, children }: WorkspaceFrameProps): ReactElement {
  const { profile, signOut } = useAuth();
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join("");
  const accountLabel = kind === "admin" ? "حساب مدیر" : profile?.accountType === "legal" ? "حساب حقوقی" : "حساب شخصی";
  const account = { name: name || (profile?.phone ? formatIranMobile(profile.phone) : "حساب کاربری"), initials, label: accountLabel };

  return (
    <WorkspaceShell kind={kind} theme={theme} account={account} onSignOut={signOut}>
      {children}
    </WorkspaceShell>
  );
}
