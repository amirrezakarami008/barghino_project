"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { ButtonLink } from "@/components/ui";
import { cn } from "@/shared/lib/cn";
import {
  isNavActive,
  publicNav,
  publicServiceLinks,
} from "@/shared/layout/site-nav";
import { ThemeToggle } from "@/shared/theme";
import { Icon } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";
import "./site-header.css";

const SCROLL_SHRINK_AT = 24;

function useScrolledPast(threshold: number) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

function NavPill({ show }: { show: boolean }) {
  const reduceMotion = useReducedMotion();
  if (!show) return null;
  return (
    <motion.span
      layoutId="site-nav-active-pill"
      className="site-nav-pill"
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
      }
      aria-hidden
    />
  );
}

function NavItemLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="site-nav-link"
      onClick={onNavigate}
    >
      <NavPill show={active} />
      <span className="relative z-[1]">{label}</span>
      <span className="site-nav-link__underline" aria-hidden />
      {active ? <span className="site-nav-dot" aria-hidden /> : null}
    </Link>
  );
}

function ServicesMega({
  open,
  onClose,
  onNavigate,
  panelId,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate?: () => void;
  panelId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const reduceMotion = useReducedMotion();
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const first = itemRefs.current[0];
    first?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, triggerRef]);

  const onItemKeyDown = (event: ReactKeyboardEvent<HTMLAnchorElement>, index: number) => {
    const last = publicServiceLinks.length - 1;
    if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      itemRefs.current[(index + 1) % publicServiceLinks.length]?.focus();
    }
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      itemRefs.current[(index - 1 + publicServiceLinks.length) % publicServiceLinks.length]?.focus();
    }
    if (event.key === "Home") {
      event.preventDefault();
      itemRefs.current[0]?.focus();
    }
    if (event.key === "End") {
      event.preventDefault();
      itemRefs.current[last]?.focus();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      triggerRef.current?.focus();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id={panelId}
          role="menu"
          aria-label="خدمات"
          className="site-header-mega"
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {publicServiceLinks.map((item, index) => (
              <Link
                key={item.href}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                href={item.href}
                role="menuitem"
                className="site-header-mega__card"
                onClick={() => {
                  onNavigate?.();
                  onClose();
                }}
                onKeyDown={(event) => onItemKeyDown(event, index)}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-grad-sun text-primary-foreground shadow-sun">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-nav font-semibold text-foreground">{item.label}</span>
                  <span className="mt-0.5 block text-caption text-foreground-muted">
                    {item.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DesktopNav({
  pathname,
  servicesOpen,
  setServicesOpen,
}: {
  pathname: string;
  servicesOpen: boolean;
  setServicesOpen: (open: boolean) => void;
}) {
  const servicesActive = isNavActive(pathname, { href: "/services" });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const servicesPanelId = useId();

  const closeServices = useCallback(() => setServicesOpen(false), [setServicesOpen]);

  useEffect(() => {
    if (!servicesOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) closeServices();
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [servicesOpen, closeServices]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setServicesOpen(true);
    }
    if (event.key === "Escape") {
      closeServices();
      triggerRef.current?.focus();
    }
  };

  return (
    <LayoutGroup id="site-public-nav">
      <nav aria-label="صفحات اصلی" className="relative flex items-center gap-0.5">
        {publicNav.map((item) => {
          if (item.href === "/services") {
            const active = servicesActive;
            return (
              <div key={item.href} ref={wrapRef} className="relative">
                <button
                  ref={triggerRef}
                  type="button"
                  className="site-nav-link"
                  aria-expanded={servicesOpen}
                  aria-haspopup="menu"
                  aria-controls={servicesPanelId}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setServicesOpen(!servicesOpen)}
                  onKeyDown={onTriggerKeyDown}
                >
                  <NavPill show={active} />
                  <span className="relative z-[1] inline-flex items-center gap-1">
                    {item.label}
                    <Icon
                      name="chevron"
                      className={cn(
                        "size-3.5 rotate-[-90deg] transition-transform duration-fast",
                        servicesOpen && "rotate-90",
                      )}
                    />
                  </span>
                  <span className="site-nav-link__underline" aria-hidden />
                  {active ? <span className="site-nav-dot" aria-hidden /> : null}
                </button>
                <ServicesMega
                  open={servicesOpen}
                  onClose={closeServices}
                  panelId={servicesPanelId}
                  triggerRef={triggerRef}
                />
              </div>
            );
          }

          return (
            <NavItemLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={isNavActive(pathname, item)}
            />
          );
        })}
      </nav>
    </LayoutGroup>
  );
}

function MobileDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const [servicesExpanded, setServicesExpanded] = useState(false);

  useEffect(() => {
    if (!open) {
      setServicesExpanded(false);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="site-header-drawer lg:hidden" role="presentation">
          <motion.button
            type="button"
            className="absolute inset-0 bg-ink-950/45"
            aria-label="بستن منو"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          />
          <motion.div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="site-header-drawer__panel"
            initial={reduceMotion ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: "-100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
              <h2 id={titleId} className="text-h4">
                منوی سایت
              </h2>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-pill border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="بستن منو"
                  onClick={onClose}
                >
                  <Icon name="close" className="size-5" />
                </button>
              </div>
            </div>

            <nav aria-label="منوی موبایل" className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="grid gap-1">
                {publicNav.map((item) => {
                  if (item.href === "/services") {
                    const active = isNavActive(pathname, item);
                    return (
                      <li key={item.href}>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full min-h-14 items-center justify-between rounded-xl px-4 text-start text-lg font-medium transition-colors duration-fast",
                            active ? "text-foreground" : "text-foreground-muted",
                          )}
                          aria-expanded={servicesExpanded}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setServicesExpanded((v) => !v)}
                        >
                          {item.label}
                          <Icon
                            name="chevron"
                            className={cn(
                              "size-4 rotate-[-90deg] transition-transform duration-fast",
                              servicesExpanded && "rotate-90",
                            )}
                          />
                        </button>
                        {servicesExpanded ? (
                          <ul className="mb-2 me-2 ms-3 grid gap-1 border-s border-border ps-3">
                            {publicServiceLinks.map((service) => (
                              <li key={service.href}>
                                <Link
                                  href={service.href}
                                  className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-base text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  onClick={onClose}
                                >
                                  <Icon name={service.icon} className="size-5 text-sun-600" />
                                  <span>
                                    <span className="block font-medium">{service.label}</span>
                                    <span className="block text-caption text-foreground-muted">
                                      {service.description}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  }

                  const active = isNavActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-14 items-center rounded-xl px-4 text-lg font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-[color-mix(in_srgb,var(--sun-400)_12%,transparent)] text-foreground"
                            : "text-foreground-muted hover:bg-surface hover:text-foreground",
                        )}
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="grid gap-2 border-t border-border p-4">
              <ButtonLink href="/login" variant="ghost" className="w-full">
                ورود
              </ButtonLink>
              <ButtonLink href="/register" className="site-header-cta-shine w-full">
                ثبت‌نام
              </ButtonLink>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(SCROLL_SHRINK_AT);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    setServicesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <div
            className={cn("site-header__bar", scrolled && "site-header__bar--scrolled")}
          >
            <Logo caption={false} />

            <div className="ms-auto hidden items-center gap-3 lg:flex">
              <DesktopNav
                pathname={pathname}
                servicesOpen={servicesOpen}
                setServicesOpen={setServicesOpen}
              />
              <div className="flex items-center gap-2">
                <ButtonLink href="/login" variant="ghost" size="sm">
                  ورود
                </ButtonLink>
                <ThemeToggle />
                <ButtonLink href="/register" size="sm" className="site-header-cta-shine">
                  ثبت‌نام
                </ButtonLink>
              </div>
            </div>

            <button
              type="button"
              className="ms-auto grid size-11 place-items-center rounded-pill border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setMobileOpen(true)}
            >
              <span className="sr-only">باز کردن منو</span>
              <Icon name="menu" className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />

      <div className="site-header-mobile-cta lg:hidden">
        <ButtonLink href="/register" className="site-header-cta-shine w-full">
          ثبت‌نام
        </ButtonLink>
      </div>
    </>
  );
}
