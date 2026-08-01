import { Panel, PanelHeader } from "./Panel";
import { Button, LinkArrow } from "@/shared/ui/Button";
import type { PlantHealth } from "@/features/dashboard/lib/assistant";
import { cn } from "@/shared/lib/utils";

const levelStyles = {
  excellent: "from-emerald-500 to-teal-500 text-white",
  good: "from-brand-500 to-brand-600 text-white",
  watch: "from-amber-400 to-orange-500 text-white",
  critical: "from-red-500 to-rose-600 text-white",
} as const;

const barColor = {
  excellent: "bg-emerald-500",
  good: "bg-brand-500",
  watch: "bg-amber-500",
  critical: "bg-red-500",
} as const;

export function HealthScorePanel({
  health,
  compact = false,
}: {
  health: PlantHealth;
  compact?: boolean;
}) {
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
          ) : undefined
        }
      />

      <div className={cn("flex flex-col gap-5", !compact && "sm:flex-row sm:items-start")}>
        <div
          className={cn(
            "flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg",
            levelStyles[health.level],
          )}
        >
          <p className="font-display text-3xl font-black">{health.score}</p>
          <p className="text-xs opacity-90">از ۱۰۰</p>
        </div>

        <div className="min-w-0 flex-1">
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

          {health.issues.length > 0 && (
            <ul className="mt-4 space-y-1.5 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-sm text-amber-900">
              {health.issues.map((issue) => (
                <li key={issue} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}
