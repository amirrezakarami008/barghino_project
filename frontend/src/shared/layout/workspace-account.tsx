"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";
import { Icon } from "@/shared/ui/icon";
import type { WorkspaceAccountDetails } from "./workspace-types";

type WorkspaceAccountProps = {
  readonly account: WorkspaceAccountDetails;
  readonly profileHref: string;
  readonly onNavigate?: () => void;
  readonly onSignOut: () => Promise<void>;
};

export function WorkspaceAccount({ account, profileHref, onNavigate, onSignOut }: WorkspaceAccountProps): ReactElement {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSignOut() {
    if (isPending) return;
    setIsPending(true);
    setError(undefined);
    try {
      await onSignOut();
    } catch {
      setError("خروج انجام نشد. دوباره تلاش کنید.");
      setIsPending(false);
    }
  }

  return (
    <div className="workspace-account">
      <div className="workspace-account-row">
        <Link href={profileHref} className="workspace-profile-link" onClick={onNavigate}>
          <span className="workspace-avatar" aria-hidden="true">{account.initials || <Icon name="user" />}</span>
          <span className="workspace-account-copy"><strong>{account.name}</strong><span>{account.label}</span></span>
        </Link>
        <button type="button" className="workspace-icon-button workspace-sign-out" aria-label={isPending ? "در حال خروج…" : "خروج"} title={isPending ? "در حال خروج…" : "خروج"} disabled={isPending} onClick={() => void handleSignOut()}>
          <Icon name="logout" />
        </button>
      </div>
      {error ? <p role="alert" className="workspace-sign-out-error">{error}</p> : null}
    </div>
  );
}
