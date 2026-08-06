import { Panel, PanelHeader } from "./Panel";
import { Button, LinkArrow } from "@/shared/ui/Button";
import type { MaintenanceAlert } from "@/features/dashboard/lib/assistant";
import { cn } from "@/shared/lib/utils";

const severityStyles = {
  info: "border-emerald-200 bg-emerald-50/70",
  warning: "border-amber-200 bg-amber-50/80",
  critical: "border-red-200 bg-red-50/80",
} as const;

const badgeStyles = {
  info: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-700",
} as const;

const severityLabel = {
  info: "عالی",
  warning: "متوسط",
  critical: "فوری",
} as const;

export function MaintenanceAlertsPanel({
  alerts,
  limit,
}: {
  alerts: MaintenanceAlert[];
  limit?: number;
}) {
  const items = limit ? alerts.slice(0, limit) : alerts;

  return (
    <Panel>
      <PanelHeader
        title="نگهداری پیشگیرانه و هشدارها"
        description="قبل از افت درآمد، مشکل را ببین"
        action={
          <Button href="/dashboard/assistant" variant="ghost" size="sm" className="group">
            تحلیل با دستیار
            <LinkArrow />
          </Button>
        }
      />

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">هشدار فعالی نیست. وضعیت پایدار است.</p>
      ) : (
        <div className="space-y-3">
          {items.map((alert) => (
            <div
              key={alert.id}
              className={cn("rounded-2xl border p-4", severityStyles[alert.severity])}
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                    badgeStyles[alert.severity],
                  )}
                >
                  {severityLabel[alert.severity]}
                </span>
                <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
              </div>
              <p className="text-sm leading-7 text-slate-600">{alert.message}</p>
              {alert.action ? (
                <p className="mt-2 text-xs font-medium text-brand-700">پیشنهاد: {alert.action}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
