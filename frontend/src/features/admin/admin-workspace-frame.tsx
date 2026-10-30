"use client";

import type { ReactElement, ReactNode } from "react";
import { useAuth } from "@/features/auth/session-provider";
import { formatIranMobile } from "@/features/auth/lib/phone";
import { AdminShell } from "./admin-shell";

export function AdminWorkspaceFrame({ children }: { readonly children: ReactNode }): ReactElement {
  const { profile, signOut } = useAuth();
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join("");
  const account = {
    name: name || (profile?.phone ? formatIranMobile(profile.phone) : "حساب مدیر"),
    initials,
    label: "حساب مدیر",
  };
  return (
    <AdminShell account={account} onSignOut={signOut}>
      {children}
    </AdminShell>
  );
}
