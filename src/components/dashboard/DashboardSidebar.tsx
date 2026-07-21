"use client";

import { Avatar } from "@/components/ui/MediaImage";
import { DASHBOARD_NAV, DASHBOARD_USER } from "@/lib/constants";
import { getDashboardIcon } from "@/lib/dashboard-icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap } from "@/lib/icons";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const navContent = (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-white">
            پنل {DASHBOARD_USER.company ? "سازمانی" : "کاربری"}
          </p>
          <p className="text-xs text-slate-500">برق ما</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {DASHBOARD_NAV.map((item) => {
          const Icon = getDashboardIcon(item.icon);
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-l from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-brand-600 text-white",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-slate-800/80 pt-6">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-3 ring-1 ring-slate-700/50">
          {DASHBOARD_USER.avatar && (
            <Avatar src={DASHBOARD_USER.avatar} alt={DASHBOARD_USER.name} size="sm" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{DASHBOARD_USER.name}</p>
            <p className="truncate text-xs text-slate-500">{DASHBOARD_USER.phone}</p>
          </div>
        </div>
        <Link
          href="/"
          className="mt-3 block rounded-xl px-3 py-2.5 text-center text-xs text-slate-500 transition-colors hover:bg-slate-800 hover:text-brand-300"
        >
          بازگشت به سایت
        </Link>
      </div>
    </>
  );

  return (
    <>
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-xl shadow-brand-500/40 lg:hidden"
          style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          aria-label="باز کردن منو"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-800/80 bg-slate-950 p-5 lg:flex">
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-72 flex-col bg-slate-950 p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mb-4 self-end rounded-lg p-2 text-slate-400 hover:bg-slate-800"
              aria-label="بستن منو"
            >
              <X className="h-5 w-5" />
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
