import type { ReactNode } from "react";
import { WorkspaceShell } from "@/shared/layout/workspace-shell";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell kind="user">{children}</WorkspaceShell>;
}
