"use client";

import { cn } from "@/shared/lib/utils";
import type { ProductionPoint } from "@/shared/types/dashboard";

interface ProductionChartProps {
  data: ProductionPoint[];
  showEarnings?: boolean;
  className?: string;
}

export function ProductionChart({ data, showEarnings = false, className }: ProductionChartProps) {
  const maxProduction = Math.max(...data.map((d) => d.production));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-end justify-between gap-2 sm:gap-3">
        {data.map((point) => {
          const height = (point.production / maxProduction) * 100;
          return (
            <div key={point.label} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-40 w-full items-end justify-center sm:h-48">
                <div
                  className="w-full max-w-[2.5rem] rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-300 transition-all group-hover:from-amber-600 group-hover:to-amber-400 sm:max-w-[3rem]"
                  style={{ height: `${height}%` }}
                  title={`${point.production} kWh`}
                />
              </div>
              <span className="text-[10px] text-slate-500 sm:text-xs">{point.label}</span>
              {showEarnings && (
                <span className="hidden text-[10px] font-medium text-emerald-700 sm:block">
                  {(point.earnings / 1_000_000).toFixed(1)}M
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
          تولید (kWh)
        </span>
        {showEarnings && (
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            درآمد (میلیون تومان)
          </span>
        )}
      </div>
    </div>
  );
}
