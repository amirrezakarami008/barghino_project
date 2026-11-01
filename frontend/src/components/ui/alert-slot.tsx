"use client";

import { cn } from "@/shared/lib/cn";
import { Alert } from "./alert";
import { filterAlertsByPlacement } from "./alert-logic";
import type { AlertDescriptor } from "./alert-types";

export type AlertSlotProps = {
  placement: string;
  alerts: readonly AlertDescriptor[];
  className?: string;
};

/** Inline channel: render contextual alerts next to the relevant fields. */
export function AlertSlot({ placement, alerts, className }: AlertSlotProps) {
  const visible = filterAlertsByPlacement(alerts, placement);

  return (
    <div className={cn("ui-alert-slot", className)} data-placement={placement}>
      {visible.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          title={alert.title}
          description={alert.description}
          items={alert.items}
          actions={alert.actions}
          dismissible={alert.dismissible ?? Boolean(alert.dismissKey)}
          dismissKey={alert.dismissKey}
          details={alert.details}
          compact={alert.compact}
          icon={alert.icon}
        />
      ))}
    </div>
  );
}
