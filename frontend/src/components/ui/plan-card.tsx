import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { formatFa } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { Badge } from "./badge";
import { Button } from "./button";
import "./plan-card.css";

export type PlanCardProps = {
  name: string;
  buyRate: number;
  energyCommitment: string;
  benefits: readonly string[];
  recommended?: boolean;
  selected?: boolean;
  sample?: boolean;
  actionLabel?: string;
  onSelect?: () => void;
  footer?: ReactNode;
  className?: string;
};

/** Max benefit rows used to keep plan cards aligned in a comparison grid. */
const BENEFIT_ROWS = 4;

function displayCommitment(value: string, sample: boolean) {
  if (!sample) return value;
  return value.replace(/\s*·\s*نمونه\s*$/u, "").trim();
}

export function PlanCard({
  name,
  buyRate,
  energyCommitment,
  benefits,
  recommended = false,
  selected = false,
  sample = true,
  actionLabel = "انتخاب طرح",
  onSelect,
  footer,
  className,
}: PlanCardProps) {
  const commitment = displayCommitment(energyCommitment, sample);
  const rows = Array.from({ length: BENEFIT_ROWS }, (_, index) => benefits[index] ?? null);

  const inner = (
    <>
      {recommended ? (
        <span className="plan-card__ribbon" aria-hidden={false}>
          پیشنهادی
        </span>
      ) : null}

      {sample ? (
        <span className="plan-card__sample-chip">
          <Badge tone="soft">نمونه</Badge>
        </span>
      ) : null}

      <div className={cn("flex items-start justify-between gap-3", sample && "pe-14")}>
        <div className="min-w-0">
          <h3 className="text-h3">{name}</h3>
        </div>
        {selected ? <Badge status="active">انتخاب‌شده</Badge> : null}
      </div>

      <p className="mt-4 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className="plan-card__price tabular-nums">{formatFa(buyRate)}</span>
        <span className="text-caption text-foreground-muted">تومان / کیلووات‌ساعت</span>
      </p>

      <p className="mt-2 text-sm leading-6 text-foreground-muted">
        تعهد انرژی: <span className="font-semibold text-foreground">{commitment}</span>
      </p>

      <ul className="plan-card__benefits mt-5 flex-1">
        {rows.map((benefit, index) => (
          <li
            key={benefit ?? `empty-${index}`}
            className={cn("plan-card__benefit", !benefit && "invisible")}
            aria-hidden={!benefit || undefined}
          >
            {benefit ? (
              <>
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-energy-600 dark:text-energy-400" />
                <span>{benefit}</span>
              </>
            ) : (
              <span>&nbsp;</span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-3">
        {onSelect ? (
          <Button
            variant={recommended || selected ? "primary" : "ghost"}
            className={cn(
              "w-full",
              recommended && "bg-grad-sun text-primary-foreground shadow-sun",
              !recommended && !selected && "border border-border bg-transparent",
            )}
            onClick={onSelect}
          >
            {selected ? "انتخاب شده" : actionLabel}
          </Button>
        ) : null}
        {footer}
      </div>
    </>
  );

  if (recommended) {
    return (
      <article
        className={cn("plan-card plan-card--recommended relative h-full", className)}
        data-selected={selected || undefined}
      >
        <div className="plan-card__recommended-inner">{inner}</div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "plan-card plan-card--quiet relative flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-fast ease-out hover:-translate-y-0.5 hover:shadow-lifted",
        selected && "border-energy-400 shadow-energy-glow ring-2 ring-energy-400/40",
        className,
      )}
      data-selected={selected || undefined}
    >
      {inner}
    </article>
  );
}

export { BENEFIT_ROWS };
