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

  return (
    <article
      className={cn(
        "plan-card",
        recommended && "plan-card--recommended",
        selected && "plan-card--selected",
        className,
      )}
      data-selected={selected || undefined}
      data-recommended={recommended || undefined}
      aria-label={recommended ? `${name} · پیشنهادی` : name}
    >
      <div className="plan-card__accent" aria-hidden />

      <div className="plan-card__top">
        <div className="plan-card__identity">
          <span className="plan-card__glyph" aria-hidden>
            <Icon name="bolt" className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="plan-card__tags">
              {recommended ? (
                <span className="plan-card__recommended-chip">
                  <Icon name="star" className="size-3.5" />
                  پیشنهادی
                </span>
              ) : null}
              {sample ? <Badge tone="soft">نمونه</Badge> : null}
              {selected ? <Badge status="active">انتخاب‌شده</Badge> : null}
            </div>
            <h3 className="plan-card__name">{name}</h3>
          </div>
        </div>
      </div>

      <div className="plan-card__metrics">
        <div className="plan-card__metric plan-card__metric--rate">
          <span className="plan-card__metric-label">نرخ خرید</span>
          <p className="plan-card__price tabular-nums">
            <span>{formatFa(buyRate)}</span>
            <span className="plan-card__price-unit">تومان / kWh</span>
          </p>
        </div>
        <div className="plan-card__metric">
          <span className="plan-card__metric-label">تعهد انرژی</span>
          <p className="plan-card__commitment">{commitment}</p>
        </div>
      </div>

      <ul className="plan-card__benefits">
        {rows.map((benefit, index) => (
          <li
            key={benefit ?? `empty-${index}`}
            className={cn("plan-card__benefit", !benefit && "invisible")}
            aria-hidden={!benefit || undefined}
          >
            {benefit ? (
              <>
                <Icon name="check" className="size-3.5 shrink-0" />
                <span>{benefit}</span>
              </>
            ) : (
              <span>&nbsp;</span>
            )}
          </li>
        ))}
      </ul>

      <div className="plan-card__footer">
        {onSelect ? (
          <Button
            variant={selected ? "primary" : "secondary"}
            className="plan-card__action w-full"
            onClick={onSelect}
          >
            {selected ? (
              <>
                <Icon name="check" className="size-4" />
                انتخاب شده
              </>
            ) : (
              actionLabel
            )}
          </Button>
        ) : null}
        {footer}
      </div>
    </article>
  );
}

export { BENEFIT_ROWS };
