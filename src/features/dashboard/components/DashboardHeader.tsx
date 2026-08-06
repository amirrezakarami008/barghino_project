"use client";

import { Bell } from "@/features/dashboard/lib/icons";
import { DASHBOARD_USER, NOTIFICATIONS } from "@/features/dashboard/constants";
import { Avatar } from "@/shared/ui/MediaImage";
import { MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function DashboardHeader({ title, subtitle, action }: DashboardHeaderProps) {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-extrabold text-slate-900 sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {action}

          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 sm:inline-flex"
            aria-label="جستجو"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <Link
            href="/dashboard/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
            aria-label="اعلان‌ها"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 ? (
              <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            ) : null}
          </Link>

          <Link
            href="/dashboard/support"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 sm:inline-flex"
            aria-label="پیام‌ها"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
          </Link>

          <Link
            href="/dashboard/profile"
            className="ms-1 overflow-hidden rounded-full"
            aria-label={DASHBOARD_USER.name}
          >
            {DASHBOARD_USER.avatar ? (
              <Avatar src={DASHBOARD_USER.avatar} alt={DASHBOARD_USER.name} size="sm" />
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
