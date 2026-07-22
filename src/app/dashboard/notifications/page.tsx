"use client";

import { DashboardPage, Panel, StatusBadge } from "@/features/dashboard/components";
import { NOTIFICATIONS } from "@/features/dashboard/constants";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";

const typeIcons: Record<string, string> = {
  billing: "💰",
  warning: "⚠️",
  success: "✅",
  info: "ℹ️",
};

export default function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <DashboardPage
      title="اعلان‌ها"
      subtitle={unread.length > 0 ? `${unread.length} اعلان خوانده‌نشده` : "همه اعلان‌ها خوانده شده"}
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
        {items.map((n) => (
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
                <p className="mt-2 text-xs text-slate-400">{n.date}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </DashboardPage>
  );
}
