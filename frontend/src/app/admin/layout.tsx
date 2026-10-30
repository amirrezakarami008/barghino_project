import { Suspense, type ReactNode } from "react";
import { RequireSession } from "@/features/auth/components/require-session";
import { AdminWorkspaceFrame } from "@/features/admin/admin-workspace-frame";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p role="status" className="p-6 text-sm text-muted-foreground">در حال بررسی نشست…</p>}>
      <RequireSession area="admin">
        <AdminWorkspaceFrame>{children}</AdminWorkspaceFrame>
      </RequireSession>
    </Suspense>
  );
}
