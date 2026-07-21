"use client";

import { Bell, Headphones } from "@/lib/dashboard-icons";
import { DASHBOARD_USER, NOTIFICATIONS } from "@/lib/constants";
import { Avatar } from "@/components/ui/MediaImage";
import Link from "next/link";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
          {subtitle && <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/support"
            className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 sm:flex"
            aria-label="پشتیبانی"
          >
            <Headphones className="h-5 w-5" />
          </Link>
          <Link
            href="/dashboard/notifications"
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
            aria-label="اعلان‌ها"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-3 transition-colors hover:border-brand-200">
            {DASHBOARD_USER.avatar && (
              <Avatar src={DASHBOARD_USER.avatar} alt={DASHBOARD_USER.name} size="sm" />
            )}
            <span className="hidden text-sm font-medium text-slate-700 md:block">
              {DASHBOARD_USER.name.split(" ")[0]}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
