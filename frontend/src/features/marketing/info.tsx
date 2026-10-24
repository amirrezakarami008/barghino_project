import type { ReactNode } from "react";
import { faDigits } from "@/shared/lib/fa";
import { ButtonLink } from "@/shared/ui/button";

export function PageIntro({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  action?: { href: string; label: string };
}) {
  return (
    <header className="max-w-3xl">
      <p className="text-sm font-semibold text-emerald">{eyebrow}</p>
      <h1 className="mt-2 text-3xl leading-[1.45] font-bold text-primary sm:text-4xl">{title}</h1>
      <p className="mt-4 text-base leading-8 text-muted-foreground">{lede}</p>
      {action ? (
        <ButtonLink href={action.href} className="mt-6">
          {action.label}
        </ButtonLink>
      ) : null}
    </header>
  );
}

export function InfoShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">{children}</div>;
}

export function StepList({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="mt-8 grid gap-4 md:grid-cols-3">
      {items.map((item, index) => (
        <li key={item.title} className="rounded-panel border border-border bg-card p-5">
          <span className="text-sm font-bold text-emerald">{faDigits(index + 1)}</span>
          <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}
