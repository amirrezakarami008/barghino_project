import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";

export type StepState = "done" | "current" | "blocked" | "rejected";

export type StepItem = {
  id: string;
  label: string;
  description?: string;
  state: StepState;
};

const stepIcon = cva(
  "flex size-10 shrink-0 items-center justify-center rounded-pill border text-sm font-bold transition-colors duration-fast ease-out",
  {
    variants: {
      state: {
        done: "border-status-approved-border bg-status-approved-bg text-status-approved",
        current: "border-transparent bg-grad-sun text-primary-foreground shadow-sun-glow",
        blocked: "border-border bg-surface text-foreground-muted",
        rejected: "border-status-rejected-border bg-status-rejected-bg text-status-rejected",
      },
    },
  },
);

export type StepperProps = {
  steps: readonly StepItem[];
  className?: string;
};

export function Stepper({ steps, className }: StepperProps) {
  return (
    <ol
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-start md:gap-0",
        className,
      )}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.id}
            className="relative flex flex-1 gap-3 md:flex-col md:items-center md:px-2 md:text-center"
          >
            {!isLast ? (
              <span
                aria-hidden
                className="absolute start-5 top-10 h-[calc(100%-0.5rem)] w-px bg-border md:inset-inline-start-1/2 md:top-5 md:h-px md:w-[calc(100%-0.5rem)] md:-translate-x-1/2 rtl:md:translate-x-1/2"
              />
            ) : null}
            <span className={cn(stepIcon({ state: step.state }), "relative z-10")}>
              {step.state === "done" ? (
                <Icon name="check" className="size-4" />
              ) : step.state === "rejected" ? (
                <Icon name="close" className="size-4" />
              ) : step.state === "blocked" ? (
                <Icon name="lock" className="size-4" />
              ) : (
                <span aria-hidden>{index + 1}</span>
              )}
            </span>
            <div className="min-w-0 space-y-0.5 pb-2 md:pb-0">
              <p
                className={cn(
                  "text-sm font-semibold",
                  step.state === "blocked" && "text-foreground-muted",
                  step.state === "rejected" && "text-status-rejected",
                  step.state === "current" && "text-foreground",
                  step.state === "done" && "text-status-approved",
                )}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="text-caption text-foreground-muted">{step.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
