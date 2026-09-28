"use client";

import { Panel, PanelHeader } from "./Panel";
import { Button, LinkArrow } from "@/shared/ui/Button";
import type { MaintenanceAlert, MaintenanceAlertCategory } from "@/features/dashboard/lib/assistant";
import {
  ALERT_CATEGORY_ICONS,
  ALERT_CATEGORY_LABELS,
  sortAlertsBySeverity,
} from "@/features/dashboard/lib/alert-meta";
import { cn } from "@/shared/lib/utils";
import { useMemo, useState } from "react";

const severityStyles = {
  info: "border-emerald-200 bg-emerald-50/70",
  warning: "border-amber-200 bg-amber-50/80",
  critical: "border-rose-200 bg-rose-50/80",
} as const;

const badgeStyles = {
  info: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-rose-100 text-rose-700",
} as const;

const severityLabel = {
  info: "اطلاع",
  warning: "هشدار",
  critical: "فوری",
} as const;

const iconWrap = {
  info: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
} as const;

export function MaintenanceAlertsPanel({
  alerts,
  limit,
  showFilters = false,
  title = "آلارم تجهیزات و نگهداری",
  description = "آلودگی پنل، اینورتر، کابل، سازه و حفاظت",
}: {
  alerts: MaintenanceAlert[];
  limit?: number;
  showFilters?: boolean;
  title?: string;
  description?: string;
}) {
  const [category, setCategory] = useState<MaintenanceAlertCategory | "all">("all");

  const sorted = useMemo(() => sortAlertsBySeverity(alerts), [alerts]);
  const filtered = useMemo(() => {
    if (category === "all") return sorted;
    return sorted.filter((a) => a.category === category);
  }, [sorted, category]);

  const items = limit ? filtered.slice(0, limit) : filtered;

  const categories = useMemo(() => {
    const set = new Set(alerts.map((a) => a.category));
    return Array.from(set);
  }, [alerts]);

  return (
    <Panel>
      <PanelHeader
        title={title}
        description={description}
        action={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/alarms" variant="ghost" size="sm" className="group">
              همه آلارم‌ها
              <LinkArrow />
            </Button>
          </div>
        }
      />

      {showFilters && categories.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label={`همه (${alerts.length.toLocaleString("fa-IR")})`}
          />
          {categories.map((id) => (
            <FilterChip
              key={id}
              active={category === id}
              onClick={() => setCategory(id)}
              label={ALERT_CATEGORY_LABELS[id]}
            />
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
          آلارم فعالی در این فیلتر نیست. وضعیت پایدار است.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((alert) => {
            const Icon = ALERT_CATEGORY_ICONS[alert.category];
            return (
              <div
                key={alert.id}
                className={cn("rounded-2xl border p-4 transition", severityStyles[alert.severity])}
              >
                <div className="flex gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      iconWrap[alert.severity],
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                          badgeStyles[alert.severity],
                        )}
                      >
                        {severityLabel[alert.severity]}
                      </span>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200/80">
                        {ALERT_CATEGORY_LABELS[alert.category]}
                      </span>
                      {alert.impactPercent != null && (
                        <span className="text-[10px] font-semibold text-rose-600">
                          تا ~{alert.impactPercent.toLocaleString("fa-IR")}٪ اثر تولید
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{alert.message}</p>
                    {alert.action ? (
                      <p className="mt-2 text-xs font-medium text-brand-700">
                        پیشنهاد: {alert.action}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {alert.href ? (
                        <Button href={alert.href} size="sm" variant="outline">
                          پیگیری
                        </Button>
                      ) : null}
                      {alert.category === "wash" ? (
                        <Button href="/dashboard/assistant" size="sm" variant="ghost">
                          راهنمای شستشو
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-bold transition",
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      )}
    >
      {label}
    </button>
  );
}
