"use client";

import { DashboardPage, Panel, StatusBadge } from "@/features/dashboard/components";
import { NOTIFICATIONS } from "@/features/dashboard/constants";
import { useContracts } from "@/features/contracts";
import { getExpiryNotifications } from "@/features/contracts/lib/store";
import { getEquipmentAlertNotifications } from "@/features/dashboard/lib/assistant";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { useMemo, useState } from "react";
import type { Notification } from "@/shared/types/dashboard";

const typeIcons: Record<string, string> = {
  billing: "💰",
  warning: "⚠️",
  success: "✅",
  info: "ℹ️",
};

type NotificationItem = Notification & { contractId?: string; href?: string };

export default function NotificationsPage() {
  const { contracts } = useContracts();
  const expiryItems = useMemo(() => getExpiryNotifications(contracts), [contracts]);
  const equipmentItems = useMemo(
    () =>
      getEquipmentAlertNotifications().map((n) => ({
        ...n,
        type: n.type as Notification["type"],
      })),
    [],
  );

  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);
  const merged = useMemo<NotificationItem[]>(
    () => [...equipmentItems, ...expiryItems, ...items],
    [equipmentItems, expiryItems, items],
  );
  const unread = merged.filter((n) => !n.read);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <DashboardPage
      title="اعلان‌ها"
      subtitle={unread.length > 0 ? `${unread.length} اعلان خوانده‌نشده` : "همه اعلان‌ها خوانده شده"}
      action={
        <Button href="/dashboard/alarms" variant="outline" size="sm">
          آلارم تجهیزات
        </Button>
      }
    >
      {unread.length > 0 && (
        <button
          type="button"
          onClick={markAllRead}
          className="mb-4 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          علامت‌گذاری همه به عنوان خوانده‌شده
        </button>
      )}

      <div className="space-y-3">
        {merged.map((n) => (
          <Panel
            key={n.id}
            padding="sm"
            className={cn(!n.read && "border-brand-200 bg-brand-50/30")}
          >
            <div className="flex gap-4 p-2">
              <span className="text-2xl">{typeIcons[n.type] ?? "📌"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{n.title}</h3>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                  <StatusBadge status={n.type} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="text-xs text-slate-400">{n.date}</p>
                  {n.contractId ? (
                    <Button href={`/dashboard/contracts/${n.contractId}`} variant="ghost" size="sm">
                      مشاهده قرارداد
                    </Button>
                  ) : null}
                  {n.href && !n.contractId ? (
                    <Button href={n.href} variant="ghost" size="sm">
                      پیگیری آلارم
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </DashboardPage>
  );
}
