import { getDashboardIcon } from "@/features/dashboard/lib/icons";
import { cn } from "@/shared/lib/utils";
import type { DashboardStat } from "@/shared/types/dashboard";
import { createElement } from "react";

const colorStyles = {
  blue: "bg-brand-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

const trendStyles = {
  up: "text-emerald-600",
  down: "text-rose-500",
  neutral: "text-slate-500",
};

export function StatCard({ label, value, suffix, change, trend, icon, color }: DashboardStat) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            colorStyles[color],
          )}
        >
          {createElement(getDashboardIcon(icon), { className: "h-5 w-5" })}
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
        {suffix ? <span className="mr-1.5 text-sm font-medium text-slate-400">{suffix}</span> : null}
      </p>
      {change && trend ? (
        <p className={cn("mt-2 text-xs font-semibold", trendStyles[trend])}>{change}</p>
      ) : null}
    </div>
  );
}
