"use client";

import { cn } from "@/lib/utils";
import type { ConsumptionPoint } from "@/types/dashboard";

interface ConsumptionChartProps {
  data: ConsumptionPoint[];
  variant?: "bar" | "line";
  showCost?: boolean;
  className?: string;
}

export function ConsumptionChart({
  data,
  variant = "bar",
  showCost = false,
  className,
}: ConsumptionChartProps) {
  const maxUsage = Math.max(...data.map((d) => d.usage));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-end justify-between gap-2 sm:gap-3">
        {data.map((point) => {
          const height = (point.usage / maxUsage) * 100;
          return (
            <div key={point.label} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-40 w-full items-end justify-center sm:h-48">
                {variant === "bar" ? (
                  <div
                    className="w-full max-w-[2.5rem] rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all group-hover:from-brand-700 group-hover:to-brand-500 sm:max-w-[3rem]"
                    style={{ height: `${height}%` }}
                    title={`${point.usage} kWh`}
                  />
                ) : (
                  <div className="absolute bottom-0 h-2 w-2 rounded-full bg-brand-500" style={{ bottom: `${height}%` }} />
                )}
              </div>
              <span className="text-[10px] text-slate-500 sm:text-xs">{point.label}</span>
              {showCost && (
                <span className="hidden text-[10px] font-medium text-slate-700 sm:block">
                  {point.cost}M
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" />
          مصرف (kWh)
        </span>
        {showCost && (
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            هزینه (میلیون تومان)
          </span>
        )}
      </div>
    </div>
  );
}

interface UsageSummaryProps {
  current: number;
  previous: number;
  peak: number;
  average: number;
}

export function UsageSummary({ current, previous, peak, average }: UsageSummaryProps) {
  const change = ((current - previous) / previous) * 100;
  const isDown = change < 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "مصرف ماه جاری", value: `${current.toLocaleString("fa-IR")} kWh` },
        { label: "تغییر نسبت به ماه قبل", value: `${isDown ? "↓" : "↑"} ${Math.abs(change).toFixed(1)}٪`, highlight: isDown },
        { label: "پیک مصرف", value: `${peak} kW` },
        { label: "میانگین روزانه", value: `${average} kWh` },
      ].map((item) => (
        <div key={item.label} className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">{item.label}</p>
          <p className={cn("mt-1 text-lg font-bold", item.highlight ? "text-emerald-600" : "text-slate-900")}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
