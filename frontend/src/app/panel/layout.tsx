import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { RequireSession } from "@/features/auth/components/require-session";
import { WorkspaceFrame } from "@/features/workspace/workspace-frame";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p role="status" className="p-6 text-sm text-muted-foreground">در حال بررسی نشست…</p>}>
      <RequireSession area="user">
        <PanelFrame>{children}</PanelFrame>
      </RequireSession>
    </Suspense>
  );
}

async function PanelFrame({ children }: { children: ReactNode }) {
  const theme = (await cookies()).get("barghino-theme")?.value === "dark" ? "dark" : "light";
  return (
    <WorkspaceFrame kind="user" theme={theme}>
      {children}
    </WorkspaceFrame>
  );
}
