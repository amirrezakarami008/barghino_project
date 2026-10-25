import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { WorkspaceShell } from "@/shared/layout/workspace-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<WorkspaceShell kind="admin">{children}</WorkspaceShell>}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}

async function AdminFrame({ children }: { children: ReactNode }) {
  const theme = (await cookies()).get("barghino-theme")?.value === "dark" ? "dark" : "light";
  return (
    <WorkspaceShell kind="admin" theme={theme}>
      {children}
    </WorkspaceShell>
  );
}
