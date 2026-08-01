"use client";

import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { SITE_CONFIG, NAVIGATION } from "@/config";
import { ChevronDown, Mail, Menu, Phone, UserRound, X, Zap } from "@/shared/lib/icons";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      <div className="hidden border-b border-brand-900/40 bg-brand-950 lg:block">
        <Container>
          <div className="flex h-9 items-center justify-between text-xs text-brand-100/80 sm:text-sm">
            <div className="flex items-center gap-5">
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 text-brand-400" />
                {SITE_CONFIG.phone}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 text-brand-400" />
                {SITE_CONFIG.email}
              </a>
            </div>
            <p className="text-brand-200/70">{SITE_CONFIG.tagline}</p>
          </div>
        </Container>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          isScrolled
            ? "border-b border-slate-200/60 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur-2xl"
            : "bg-white/95 backdrop-blur-sm",
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between lg:h-[4.5rem]">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-400 to-brand-600 shadow-lg shadow-brand-500/35 transition-transform duration-300 group-hover:scale-105">
                <Zap className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/20 to-transparent" />
              </div>
              <div className="min-w-0">
                <span className="font-display block truncate text-xl font-extrabold text-slate-900">
                  {SITE_CONFIG.name}
                </span>
                <p className="hidden truncate text-xs text-slate-500 sm:block">{SITE_CONFIG.tagline}</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex">
              {NAVIGATION.map((item) =>
                item.children ? (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-brand-50 hover:text-brand-600"
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openDropdown === item.label && "rotate-180",
                        )}
                      />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute right-0 top-full z-50 pt-2">
                        <div className="min-w-[240px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl shadow-slate-900/10">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-brand-50 hover:text-brand-600"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-brand-50 hover:text-brand-600"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Button size="sm" href={SITE_CONFIG.loginHref} className="rounded-full px-5">
                <UserRound className="h-4 w-4" />
                ورود / ثبت‌نام
              </Button>
            </div>

            <button
              type="button"
              className="rounded-xl p-2.5 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
              onClick={() => setIsMobileOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </header>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
              <span className="font-display text-lg font-extrabold text-slate-900">{SITE_CONFIG.name}</span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
                aria-label="بستن منو"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 pb-6">
              {NAVIGATION.map((item) => (
                <div key={item.href} className="border-b border-slate-100 py-3.5">
                  <Link
                    href={item.href}
                    className="block font-display font-bold text-slate-900"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="mt-2.5 block pr-4 text-sm text-slate-600 hover:text-brand-600"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
            <div className="shrink-0 space-y-3 border-t border-slate-100 bg-slate-50 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <Button fullWidth href={SITE_CONFIG.registerHref} onClick={() => setIsMobileOpen(false)}>
                ثبت‌نام رایگان
              </Button>
              <Button
                fullWidth
                variant="outline"
                href={SITE_CONFIG.loginHref}
                onClick={() => setIsMobileOpen(false)}
              >
                ورود
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
