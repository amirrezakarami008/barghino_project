import { getDashboardIcon } from "@/lib/dashboard-icons";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types/dashboard";

const colorStyles = {
  blue: "bg-brand-50 text-brand-600 ring-1 ring-brand-100",
  green: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  violet: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
};

const trendStyles = {
  up: "text-emerald-600",
  down: "text-emerald-600",
  neutral: "text-slate-500",
};

export function StatCard({ label, value, suffix, change, trend, icon, color }: DashboardStat) {
  const Icon = getDashboardIcon(icon);

  return (
    <div className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/60 hover:shadow-lg hover:shadow-brand-500/5">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            colorStyles[color],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-slate-900">
        {value}
        {suffix && <span className="mr-1 text-sm font-medium text-slate-500">{suffix}</span>}
      </p>
      {change && trend && (
        <p className={cn("mt-2 text-xs font-semibold", trendStyles[trend])}>{change}</p>
      )}
    </div>
  );
}
