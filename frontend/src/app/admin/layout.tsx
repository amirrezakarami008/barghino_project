import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { RequireSession } from "@/features/auth/components/require-session";
import { AdminWorkspaceFrame } from "@/features/admin/admin-workspace-frame";
import "@/features/admin/admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p role="status" className="p-6 text-sm text-muted-foreground">در حال بررسی نشست…</p>}>
      <RequireSession area="admin">
        <AdminFrame>{children}</AdminFrame>
      </RequireSession>
    </Suspense>
  );
}

async function AdminFrame({ children }: { children: ReactNode }) {
  const theme = (await cookies()).get("barghino-admin-theme")?.value === "light" ? "light" : "dark";
  return (
    <AdminWorkspaceFrame theme={theme}>
      {children}
    </AdminWorkspaceFrame>
  );
}
