import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { Icon, type IconName } from "@/shared/ui/icon";

type AdminPageProps = {
  readonly title: string;
  readonly description: string;
  readonly action?: { readonly href: string; readonly label: string; readonly icon: IconName };
  readonly headerAction?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
};

export function AdminPage({ title, description, action, headerAction, eyebrow, className, children }: AdminPageProps): ReactElement {
  return (
    <div className={`admin-page ${className ?? ""}`}>
      <div className="admin-page-heading">
        <div>{eyebrow ? <div className="admin-eyebrow">{eyebrow}</div> : null}<h1>{title}</h1><p>{description}</p></div>
        {action ? <Link href={action.href} className="admin-button admin-button-primary"><Icon name={action.icon} />{action.label}</Link> : null}
        {headerAction}
      </div>
      {children}
      <footer className="admin-page-footer"><span>برقینو، مدیریت انرژی خورشیدی</span><span><Icon name="shield" /> فضای مدیریت</span></footer>
    </div>
  );
}
