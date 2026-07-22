import { Button } from "@/shared/ui/Button";
import { getDashboardIcon } from "@/features/dashboard/lib/icons";
import type { QuickAction } from "@/shared/types/dashboard";
import { createElement } from "react";

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Button
          key={action.href}
          href={action.href}
          variant="outline"
          className="!h-auto !flex-col !items-start !justify-start !rounded-2xl !border-slate-200 !p-4 !text-start hover:!border-brand-300 hover:!bg-brand-50/50"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            {createElement(getDashboardIcon(action.icon), { className: "h-5 w-5" })}
          </div>
          <span className="font-semibold text-slate-900">{action.label}</span>
          <span className="mt-1 text-xs font-normal text-slate-500">{action.description}</span>
        </Button>
      ))}
    </div>
  );
}
