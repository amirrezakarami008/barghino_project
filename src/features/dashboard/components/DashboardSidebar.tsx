"use client";

import { Avatar } from "@/shared/ui/MediaImage";
import { DASHBOARD_NAV, DASHBOARD_USER } from "@/features/dashboard/constants";
import { getDashboardIcon } from "@/features/dashboard/lib/icons";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/shared/constants/images";
import { cn } from "@/shared/lib/utils";
import { LogOut, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createElement, useState } from "react";
import { Menu, X } from "@/shared/lib/icons";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const navItems = DASHBOARD_NAV.filter((item) => !item.adminOnly || DASHBOARD_USER.isAdmin);

  const navContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-5 shrink-0 flex items-center gap-2.5 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-md shadow-brand-500/25">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-display text-lg font-extrabold text-slate-900">{SITE_CONFIG.name}</p>
          <p className="text-[11px] text-slate-400">پنل مدیریت نیروگاه</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pe-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {createElement(getDashboardIcon(item.icon), {
                className: cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-slate-400"),
              })}
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-brand-500 text-white",
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 shrink-0 space-y-3">
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-emerald-50/80">
          <div className="relative h-24 w-full">
            <Image
              src={IMAGES.landing.solar}
              alt="نیروگاه خورشیدی"
              fill
              className="object-cover"
              sizes="240px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent" />
          </div>
          <div className="p-3.5">
            <p className="text-sm font-bold text-slate-900">نیروگاه جدید می‌خوای؟</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">از درخواست تا بهره‌برداری کنارتیم.</p>
            <Link
              href="/dashboard/install"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex h-9 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-500"
            >
              درخواست نصب
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
          <div className="flex items-center gap-3">
            {DASHBOARD_USER.avatar ? (
              <Avatar src={DASHBOARD_USER.avatar} alt={DASHBOARD_USER.name} size="sm" />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{DASHBOARD_USER.name}</p>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                مشاهده پروفایل
              </Link>
            </div>
          </div>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            خروج از حساب
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/35 lg:hidden"
          style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          aria-label="باز کردن منو"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <aside className="hidden h-full w-[17.5rem] shrink-0 flex-col overflow-hidden border-l border-slate-200/80 bg-white p-4 lg:flex xl:w-72 xl:p-5">
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex h-full w-full max-w-[17.5rem] flex-col overflow-hidden bg-white p-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mb-3 shrink-0 self-end rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="بستن منو"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-h-0 flex-1">{navContent}</div>
          </aside>
        </div>
      )}
    </>
  );
}
