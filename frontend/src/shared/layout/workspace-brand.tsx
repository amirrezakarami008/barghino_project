import Link from "next/link";
import type { ReactElement } from "react";

type WorkspaceBrandProps = {
  readonly href: string;
  readonly caption: string;
  readonly onNavigate?: () => void;
};

export function WorkspaceBrand({ href, caption, onNavigate }: WorkspaceBrandProps): ReactElement {
  return (
    <Link href={href} className="workspace-brand" onClick={onNavigate}>
      <span className="workspace-brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
      <span className="workspace-wordmark"><strong>برقینو</strong><span>{caption}</span></span>
    </Link>
  );
}
