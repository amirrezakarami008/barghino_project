import type { AlertDescriptor, AlertVariant } from "./alert-types";
import { ALERT_SEVERITY } from "./alert-types";

function rank(alert: AlertDescriptor): number {
  return ALERT_SEVERITY[alert.variant] * 1000 + (alert.priority ?? 0);
}

/** Sort highest severity (then priority) first. Pure. */
export function sortAlerts(alerts: readonly AlertDescriptor[]): AlertDescriptor[] {
  return [...alerts].sort((a, b) => rank(b) - rank(a) || a.id.localeCompare(b.id));
}

/**
 * Drop lower-severity alerts that state the same consequence.
 * Alerts without `consequenceKey` always pass through.
 */
export function dedupeAlerts(alerts: readonly AlertDescriptor[]): AlertDescriptor[] {
  const sorted = sortAlerts(alerts);
  const seen = new Set<string>();
  const result: AlertDescriptor[] = [];
  for (const alert of sorted) {
    const key = alert.consequenceKey;
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    result.push(alert);
  }
  return result;
}

export function filterAlertsByPlacement(
  alerts: readonly AlertDescriptor[],
  placement: string,
): AlertDescriptor[] {
  return dedupeAlerts(alerts.filter((alert) => alert.placement === placement));
}

/** Page banner: at most one — highest severity wins; rest stay queued. */
export function selectBannerAlert(
  alerts: readonly AlertDescriptor[],
): { visible: AlertDescriptor | null; queued: AlertDescriptor[] } {
  const banner = dedupeAlerts(alerts.filter((alert) => alert.placement === "banner"));
  if (banner.length === 0) return { visible: null, queued: [] };
  const [visible, ...queued] = banner;
  return { visible, queued };
}

export function isAutoDismissAllowed(variant: AlertVariant, hasActions: boolean): boolean {
  if (variant === "danger") return false;
  if (hasActions) return false;
  return true;
}

/** Example selector shape for feature modules — pure, no JSX. */
export function createAlertSelector<TState>(
  select: (state: TState) => AlertDescriptor[],
): (state: TState) => AlertDescriptor[] {
  return (state) => dedupeAlerts(select(state));
}
