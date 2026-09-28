"use client";

import {
  DashboardPage,
  HealthScorePanel,
  MaintenanceAlertsPanel,
  Panel,
} from "@/features/dashboard/components";
import {
  getAllPlantHealth,
  getMaintenanceAlerts,
} from "@/features/dashboard/lib/assistant";
import {
  ALERT_CATEGORY_ICONS,
  ALERT_CATEGORY_LABELS,
  sortAlertsBySeverity,
} from "@/features/dashboard/lib/alert-meta";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { MaintenanceAlertCategory } from "@/features/dashboard/lib/assistant";
import { BellRing, Droplets, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";

export function AlarmsPageContent() {
  const alerts = useMemo(() => sortAlertsBySeverity(getMaintenanceAlerts()), []);
  const healthList = useMemo(() => getAllPlantHealth(), []);
  const [focus, setFocus] = useState<"all" | "wash" | "equipment">("all");

  const washCount = alerts.filter((a) => a.category === "wash").length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const equipmentCount = alerts.filter((a) =>
    ["inverter", "panel", "mounting", "cabling", "protection"].includes(a.category),
  ).length;

  const visible = useMemo(() => {
    if (focus === "wash") return alerts.filter((a) => a.category === "wash");
    if (focus === "equipment") {
      return alerts.filter((a) =>
        ["inverter", "panel", "mounting", "cabling", "protection"].includes(a.category),
      );
    }
    return alerts;
  }, [alerts, focus]);

  const byCategory = useMemo(() => {
    const map = new Map<MaintenanceAlertCategory, number>();
    for (const a of alerts) map.set(a.category, (map.get(a.category) ?? 0) + 1);
    return Array.from(map.entries());
  }, [alerts]);

  return (
    <DashboardPage
      title="آلارم تجهیزات"
      subtitle="آلودگی پنل، اینورتر، سازه، کابل و حفاظت — قبل از افت درآمد ببین"
      action={
        <Button href="/dashboard/support" variant="outline" size="sm">
          درخواست پشتیبانی
        </Button>
      }
    >
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-bl from-slate-900 via-amber-950 to-rose-900 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
              <BellRing className="h-3.5 w-3.5" />
              پایش هوشمند تجهیزات
            </div>
            <h2 className="mt-4 font-display text-2xl font-black sm:text-3xl">
              پنل کثیف و خرابی تجهیزات را زودتر ببین
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-amber-50/85">
              آلودگی سطح پنل، رفتار غیرعادی اینورتر، اتصالات گرم و ضعف حفاظت — همه اینجا با شدت و
              اثر تقریبی روی تولید نشان داده می‌شوند.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["all", "همه آلارم‌ها"],
                  ["wash", "آلودگی پنل"],
                  ["equipment", "سایر تجهیزات"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFocus(id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                    focus === id
                      ? "bg-white text-slate-900"
                      : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 self-end">
            {[
              {
                label: "فوری",
                value: criticalCount,
                icon: ShieldAlert,
                tone: "text-rose-200",
              },
              {
                label: "آلودگی پنل",
                value: washCount,
                icon: Droplets,
                tone: "text-sky-200",
              },
              {
                label: "تجهیزات",
                value: equipmentCount,
                icon: BellRing,
                tone: "text-amber-200",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <item.icon className={cn("mb-2 h-4 w-4", item.tone)} />
                <p className="font-display text-2xl font-black">
                  {item.value.toLocaleString("fa-IR")}
                </p>
                <p className="text-[11px] text-white/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {byCategory.map(([category, count]) => {
          const Icon = ALERT_CATEGORY_ICONS[category];
          return (
            <Panel key={category} padding="sm" className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {ALERT_CATEGORY_LABELS[category]}
                </p>
                <p className="text-xs text-slate-500">
                  {count.toLocaleString("fa-IR")} آلارم فعال
                </p>
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <MaintenanceAlertsPanel
          alerts={visible}
          showFilters
          title={
            focus === "wash"
              ? "آلارم آلودگی پنل"
              : focus === "equipment"
                ? "آلارم تجهیزات"
                : "همه آلارم‌ها"
          }
          description="بر اساس پایش سلامت نیروگاه و ریسک شستشو"
        />

        <div className="space-y-6">
          {healthList.map((health) => (
            <HealthScorePanel key={health.plantId} health={health} compact />
          ))}
          <Panel className="border-brand-100 bg-gradient-to-br from-brand-50/80 to-white">
            <p className="text-sm font-bold text-slate-900">نکته نگهداری</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              شستشوی پنل‌های کثیف معمولاً سریع‌ترین اثر را روی تولید دارد. بعد از باد و گردوغبار،
              آلارم آلودگی را جدی بگیرید؛ برای اینورتر و حفاظت حتماً با کارشناس هماهنگ کنید.
            </p>
            <Button href="/dashboard/assistant" className="mt-4" size="sm">
              پرسیدن از دستیار
            </Button>
          </Panel>
        </div>
      </div>
    </DashboardPage>
  );
}
