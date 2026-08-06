import { getDashboardIcon } from "@/features/dashboard/lib/icons";
import type { QuickAction } from "@/shared/types/dashboard";
import Link from "next/link";
import { createElement } from "react";

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map((action) => (
        <Link
          key={action.href + action.label}
          href={action.href}
          className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-3 py-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
            {createElement(getDashboardIcon(action.icon), { className: "h-5 w-5" })}
          </div>
          <span className="text-sm font-semibold text-slate-900">{action.label}</span>
          <span className="mt-1 text-[11px] text-slate-500">{action.description}</span>
        </Link>
      ))}
    </div>
  );
}
