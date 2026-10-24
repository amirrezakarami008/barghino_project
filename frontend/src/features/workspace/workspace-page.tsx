import type { ReactNode } from "react";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";

export function WorkspacePage({
  title,
  lede,
  icon,
  action,
  children,
}: {
  title: string;
  lede: string;
  icon: IconName;
  action?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{lede}</p>
        {action ? <ButtonLink href={action.href}>{action.label}</ButtonLink> : null}
      </div>
      <div className="mt-6">{children ?? <EmptyPanel icon={icon} title={title} text={lede} />}</div>
    </div>
  );
}

export function EmptyPanel({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="rounded-panel border border-dashed border-border bg-card px-6 py-10 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-mint text-primary">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">{text}</p>
    </div>
  );
}

export function MetricGrid({ items }: { items: { label: string; hint: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.label} className="rounded-panel border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-3 text-2xl font-bold text-primary">—</p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.hint}</p>
        </li>
      ))}
    </ul>
  );
}
