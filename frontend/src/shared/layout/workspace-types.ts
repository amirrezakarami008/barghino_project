import type { ReactNode } from "react";

export type WorkspaceKind = "user" | "admin";
export type WorkspaceTheme = "light" | "dark";

export type WorkspaceAccountDetails = {
  readonly name: string;
  readonly initials: string;
  readonly label: string;
};

export type WorkspaceShellProps = {
  readonly kind: WorkspaceKind;
  readonly theme?: WorkspaceTheme;
  readonly account: WorkspaceAccountDetails;
  readonly onSignOut: () => Promise<void>;
  readonly children: ReactNode;
};
