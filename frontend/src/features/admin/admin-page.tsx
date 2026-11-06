import type { ReactElement, ReactNode } from "react";
import { ButtonLink } from "@/components/ui";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";
import "./admin-desk.css";

type AdminPageProps = {
  readonly title: string;
  readonly description: string;
  readonly action?: { readonly href: string; readonly label: string; readonly icon: IconName };
  readonly headerAction?: ReactNode;
  readonly className?: string;
  /**
   * `desk` — operational admin sample (title lives in shell topbar; page shows lede + actions).
   * Reference: Admin Wallets.
   */
  readonly density?: "default" | "desk";
  readonly children: ReactNode;
};

export function AdminPage({
  title,
  description,
  action,
  headerAction,
  className,
  density = "default",
  children,
}: AdminPageProps): ReactElement {
  return (
    <div className={cn("admin-desk", className)} data-density={density}>
      <header className="admin-desk-header">
        <div className="admin-desk-header__copy">
          <h2 className="admin-desk-header__title">{title}</h2>
          <p className="admin-desk-header__lede">{description}</p>
        </div>
        <div className="admin-desk-header__actions">
          {action ? (
            <ButtonLink href={action.href} variant="primary">
              <Icon name={action.icon} className="size-4" />
              {action.label}
            </ButtonLink>
          ) : null}
          {headerAction}
        </div>
      </header>
      {children}
    </div>
  );
}

export function AdminAuditLine({ text }: { readonly text: string }): ReactElement {
  return (
    <p className="text-caption text-foreground-muted" dir="auto">
      {text}
    </p>
  );
}

export function AdminSolidSurface({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): ReactElement {
  return (
    <section className={cn("rounded-md border border-border bg-card shadow-soft", className)}>
      {children}
    </section>
  );
}
