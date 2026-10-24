import type { ReactNode } from "react";
import { WorkspaceShell } from "@/shared/layout/workspace-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell kind="admin">{children}</WorkspaceShell>;
}
