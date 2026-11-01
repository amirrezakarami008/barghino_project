"use client";

import { AlertSlot } from "./alert-slot";
import { dedupeAlerts, filterAlertsByPlacement } from "./alert-logic";
import type { AlertDescriptor } from "./alert-types";
import { Alert } from "./alert";

export type AlertRendererProps = {
  alerts: readonly AlertDescriptor[];
  /** When set, only this placement is rendered (same as AlertSlot). */
  placement?: string;
  className?: string;
};

/**
 * Single renderer for derived alert descriptors: severity sort, consequence
 * dedupe, and animated Alert instances.
 */
export function AlertRenderer({ alerts, placement, className }: AlertRendererProps) {
  if (placement) {
    return <AlertSlot placement={placement} alerts={alerts} className={className} />;
  }

  const visible = dedupeAlerts(alerts);
  const placements = [...new Set(visible.map((alert) => alert.placement))];

  return (
    <div className={className}>
      {placements.map((place) => (
        <AlertSlot key={place} placement={place} alerts={visible} />
      ))}
    </div>
  );
}

/** Convenience: render a pre-filtered list without placement grouping. */
export function renderAlertDescriptors(alerts: readonly AlertDescriptor[]) {
  return dedupeAlerts(alerts).map((alert) => (
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
  ));
}

export { filterAlertsByPlacement, dedupeAlerts };
