import type { ReactElement, ReactNode } from "react";
import { ButtonLink } from "@/components/ui";
import { Icon, type IconName } from "@/shared/ui/icon";

type AdminPageProps = {
  readonly title: string;
  readonly description: string;
  readonly action?: { readonly href: string; readonly label: string; readonly icon: IconName };
  readonly headerAction?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
};

export function AdminPage({
  title,
  description,
  action,
  headerAction,
  className,
  children,
}: AdminPageProps): ReactElement {
  return (
    <div className={className ? `space-y-4 ${className}` : "space-y-4"}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-h3">{title}</h2>
          <p className="max-w-2xl text-sm text-foreground-muted">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
    <section className={`rounded-lg border border-border bg-card shadow-soft ${className ?? ""}`}>
      {children}
    </section>
  );
}
