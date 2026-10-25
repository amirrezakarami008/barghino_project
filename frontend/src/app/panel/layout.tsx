import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { WorkspaceShell } from "@/shared/layout/workspace-shell";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<WorkspaceShell kind="user">{children}</WorkspaceShell>}>
      <PanelFrame>{children}</PanelFrame>
    </Suspense>
  );
}

async function PanelFrame({ children }: { children: ReactNode }) {
  const theme = (await cookies()).get("barghino-theme")?.value === "dark" ? "dark" : "light";
  return (
    <WorkspaceShell kind="user" theme={theme}>
      {children}
    </WorkspaceShell>
  );
}
