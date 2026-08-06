import { Panel, PanelHeader } from "./Panel";
import { Button, LinkArrow } from "@/shared/ui/Button";
import type { PlantHealth } from "@/features/dashboard/lib/assistant";
import { cn } from "@/shared/lib/utils";

const barColor = {
  excellent: "bg-emerald-500",
  good: "bg-brand-500",
  watch: "bg-amber-500",
  critical: "bg-red-500",
} as const;

const ringColor = {
  excellent: "stroke-emerald-500",
  good: "stroke-brand-500",
  watch: "stroke-amber-500",
  critical: "stroke-red-500",
} as const;

export function HealthScorePanel({
  health,
  compact = false,
}: {
  health: PlantHealth;
  compact?: boolean;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - health.score / 100);

  return (
    <Panel
      className={cn(
        health.level === "watch" || health.level === "critical"
          ? "border-amber-200"
          : "border-emerald-100",
      )}
    >
      <PanelHeader
        title="سلامت نیروگاه"
        description={health.plantName}
        action={
          !compact ? (
            <Button href="/dashboard/assistant" variant="ghost" size="sm" className="group">
              بپرس از دستیار
              <LinkArrow />
            </Button>
          ) : (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                health.level === "excellent" || health.level === "good"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {health.levelLabel}
            </span>
          )
        }
      />

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden>
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              strokeWidth="10"
              className="stroke-slate-100"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={ringColor[health.level]}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-3xl font-black text-slate-900">{health.score}</p>
            <p className="text-xs text-slate-400">از ۱۰۰</p>
          </div>
        </div>

        <div className="min-w-0 w-full flex-1">
          <p className="font-display text-lg font-bold text-slate-900">{health.levelLabel}</p>
          <p className="mt-1 text-sm text-slate-500">احتمال نیاز به شستشو: {health.washRisk}</p>

          <div className="mt-4 space-y-3">
            {health.breakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {item.label}: {item.score}٪
                  </span>
                  <span className="text-slate-400">{item.note}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full transition-all", barColor[health.level])}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
