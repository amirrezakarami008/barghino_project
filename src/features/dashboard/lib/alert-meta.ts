import type { LucideIcon } from "lucide-react";
import {
  Cable,
  CircuitBoard,
  Droplets,
  Gauge,
  ShieldAlert,
  Sun,
  Wrench,
} from "lucide-react";
import type { MaintenanceAlert, MaintenanceAlertCategory } from "@/features/dashboard/lib/assistant";

export const ALERT_CATEGORY_LABELS: Record<MaintenanceAlertCategory, string> = {
  wash: "آلودگی پنل",
  inverter: "اینورتر",
  panel: "پنل‌ها",
  mounting: "سازه",
  cabling: "کابل و اتصالات",
  protection: "حفاظت",
  production: "تولید",
  review: "بازبینی",
};

export const ALERT_CATEGORY_ICONS: Record<MaintenanceAlertCategory, LucideIcon> = {
  wash: Droplets,
  inverter: CircuitBoard,
  panel: Sun,
  mounting: Wrench,
  cabling: Cable,
  protection: ShieldAlert,
  production: Gauge,
  review: Wrench,
};

export function sortAlertsBySeverity(alerts: MaintenanceAlert[]): MaintenanceAlert[] {
  const rank = { critical: 0, warning: 1, info: 2 } as const;
  return [...alerts].sort((a, b) => rank[a.severity] - rank[b.severity]);
}
