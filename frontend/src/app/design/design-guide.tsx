"use client";

import type { ReactNode } from "react";
import { ThemeToggle } from "@/shared/theme";
import { faDigits, formatFa } from "@/shared/lib/fa";
import { cx } from "@/shared/lib/cx";
import { ComponentsPreview } from "./components-preview";

const sunSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const brandSteps = sunSteps;
const inkSteps = [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const sunBg: Record<(typeof sunSteps)[number], string> = {
  50: "bg-sun-50",
  100: "bg-sun-100",
  200: "bg-sun-200",
  300: "bg-sun-300",
  400: "bg-sun-400",
  500: "bg-sun-500",
  600: "bg-sun-600",
  700: "bg-sun-700",
  800: "bg-sun-800",
  900: "bg-sun-900",
};

const energyBg: Record<(typeof brandSteps)[number], string> = {
  50: "bg-energy-50",
  100: "bg-energy-100",
  200: "bg-energy-200",
  300: "bg-energy-300",
  400: "bg-energy-400",
  500: "bg-energy-500",
  600: "bg-energy-600",
  700: "bg-energy-700",
  800: "bg-energy-800",
  900: "bg-energy-900",
};

const voltBg: Record<(typeof brandSteps)[number], string> = {
  50: "bg-volt-50",
  100: "bg-volt-100",
  200: "bg-volt-200",
  300: "bg-volt-300",
  400: "bg-volt-400",
  500: "bg-volt-500",
  600: "bg-volt-600",
  700: "bg-volt-700",
  800: "bg-volt-800",
  900: "bg-volt-900",
};

const inkBg: Record<(typeof inkSteps)[number], string> = {
  0: "bg-ink-0",
  25: "bg-ink-25",
  50: "bg-ink-50",
  100: "bg-ink-100",
  200: "bg-ink-200",
  300: "bg-ink-300",
  400: "bg-ink-400",
  500: "bg-ink-500",
  600: "bg-ink-600",
  700: "bg-ink-700",
  800: "bg-ink-800",
  900: "bg-ink-900",
  950: "bg-ink-950",
};

const statuses = [
  "pending",
  "approved",
  "rejected",
  "draft",
  "active",
  "closed",
  "expired",
] as const;

const statusLabels: Record<(typeof statuses)[number], string> = {
  pending: "در انتظار",
  approved: "تأیید شده",
  rejected: "رد شده",
  draft: "پیش‌نویس",
  active: "فعال",
  closed: "بسته",
  expired: "منقضی",
};

const radii = [
  { className: "rounded-sm", label: "sm · ۱۰" },
  { className: "rounded-md", label: "md · ۱۴" },
  { className: "rounded-lg", label: "lg · ۲۰" },
  { className: "rounded-xl", label: "xl · ۲۸" },
  { className: "rounded-pill", label: "pill" },
] as const;

const shadows = [
  { className: "shadow-soft", label: "soft" },
  { className: "shadow-lifted", label: "lifted" },
  { className: "shadow-sun", label: "sun" },
  { className: "shadow-energy", label: "energy" },
  { className: "shadow-volt", label: "volt" },
] as const;

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <header className="space-y-2">
        <h2 className="text-h2 text-foreground">{title}</h2>
        <p className="max-w-3xl text-body text-foreground-muted">{lede}</p>
      </header>
      {children}
    </section>
  );
}

function SwatchRow({
  name,
  steps,
  classes,
}: {
  name: string;
  steps: readonly number[];
  classes: Record<number, string>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-h4 text-foreground">{name}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {steps.map((step) => (
          <div key={`${name}-${step}`} className="space-y-2">
            <div
              className={cx(
                "aspect-[4/3] rounded-md border border-border shadow-soft",
                classes[step],
              )}
              title={`--${name}-${step}`}
            />
            <p className="text-caption tabular-nums text-foreground-muted">{faDigits(step)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemePreviewCard({ mode }: { mode: "light" | "dark" }) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-xl border border-border shadow-lifted",
        mode === "dark" ? "dark" : "theme-force-light",
      )}
    >
      <div className="bg-grad-aurora p-5 text-foreground">
        <p className="text-caption text-foreground-muted">{mode === "dark" ? "Dark · midnight" : "Light · soft blobs"}</p>
        <p className="mt-2 text-h3">برقینو</p>
        <p className="mt-2 text-body text-foreground-muted">
          surface / text / muted preview
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-pill bg-grad-sun px-3 py-1 text-caption font-semibold text-primary-foreground shadow-sun">
            sun
          </span>
          <span className="rounded-pill bg-grad-energy px-3 py-1 text-caption font-semibold text-secondary-foreground shadow-energy">
            energy
          </span>
          <span className="rounded-pill bg-grad-volt px-3 py-1 text-caption font-semibold text-accent-foreground shadow-volt">
            volt
          </span>
        </div>
        <div className="mt-4 rounded-lg border border-border bg-card p-3 shadow-soft">
          <p className="text-sun-safe text-sm font-semibold">amber text AA · --sun-text</p>
          <p className="mt-1 tabular-nums text-foreground">{formatFa(15000)}</p>
        </div>
      </div>
    </div>
  );
}

export function DesignGuide() {
  return (
    <div className="min-h-dvh bg-grad-aurora text-foreground">
      <header className="glass-strong sticky top-0 z-40 border-b border-border">
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-caption text-accent">Solar Aurora</p>
            <h1 className="text-h3">راهنمای طراحی برقینو</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main id="content" className="container-page space-y-16 py-10 sm:py-14 md:space-y-20 md:py-20">
        <Section
          id="themes"
          title="حالت روشن و تاریک"
          lede="defaultTheme=system · attribute=class · ThemeToggle در هدر. پیش‌نمایش کنارهم بدون تغییر تم سراسری."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ThemePreviewCard mode="light" />
            <ThemePreviewCard mode="dark" />
          </div>
        </Section>

        <div className="section-fade h-16 rounded-xl" aria-hidden />

        <Section
          id="intro"
          title="بنیاد نشان"
          lede="پالت خورشید (sun)، انرژی (energy) و ولت (volt) روی بستر جوهر (ink). اعداد این صفحه نمونه‌اند و دادهٔ حساب واقعی نیستند."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-grad-sun p-5 text-primary-foreground shadow-sun">
              <p className="text-caption opacity-90">Brand primary</p>
              <p className="text-h3">sun · {formatFa(500)}</p>
            </div>
            <div className="rounded-xl bg-grad-energy p-5 text-secondary-foreground shadow-energy">
              <p className="text-caption opacity-90">Secondary</p>
              <p className="text-h3">energy · {formatFa(500)}</p>
            </div>
            <div className="rounded-xl bg-grad-volt p-5 text-accent-foreground shadow-volt">
              <p className="text-caption opacity-90">Accent</p>
              <p className="text-h3">volt · {formatFa(500)}</p>
            </div>
          </div>
        </Section>

        <Section id="colors" title="رنگ‌ها" lede="مقیاس‌های برند و خنثی. فقط از توکن‌ها استفاده کنید.">
          <div className="space-y-10 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <SwatchRow name="sun" steps={sunSteps} classes={sunBg} />
            <SwatchRow name="energy" steps={brandSteps} classes={energyBg} />
            <SwatchRow name="volt" steps={brandSteps} classes={voltBg} />
            <SwatchRow name="ink" steps={inkSteps} classes={inkBg} />
          </div>
        </Section>

        <Section
          id="status"
          title="وضعیت‌های معنایی"
          lede="پس‌زمینهٔ نرم + متن قوی + حاشیه — برای بج و ردیف جداول."
        >
          <div className="flex flex-wrap gap-3">
            {statuses.map((status) => (
              <span
                key={status}
                className={cx(
                  "inline-flex min-h-11 items-center rounded-pill border px-4 text-sm font-semibold",
                  status === "pending" &&
                    "border-status-pending-border bg-status-pending-bg text-status-pending",
                  status === "approved" &&
                    "border-status-approved-border bg-status-approved-bg text-status-approved",
                  status === "rejected" &&
                    "border-status-rejected-border bg-status-rejected-bg text-status-rejected",
                  status === "draft" &&
                    "border-status-draft-border bg-status-draft-bg text-status-draft",
                  status === "active" &&
                    "border-status-active-border bg-status-active-bg text-status-active",
                  status === "closed" &&
                    "border-status-closed-border bg-status-closed-bg text-status-closed",
                  status === "expired" &&
                    "border-status-expired-border bg-status-expired-bg text-status-expired",
                )}
              >
                {statusLabels[status]}
              </span>
            ))}
          </div>
        </Section>

        <Section id="gradients" title="گرادیان‌ها" lede="خورشید، انرژی، ولت، شفق قطبی پس‌زمینه، و حاشیهٔ گرادیانی کارت.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-28 rounded-xl bg-grad-sun shadow-sun" aria-label="grad-sun" />
            <div className="h-28 rounded-xl bg-grad-energy shadow-energy" aria-label="grad-energy" />
            <div className="h-28 rounded-xl bg-grad-volt shadow-volt" aria-label="grad-volt" />
            <div
              className="h-36 rounded-xl border border-border bg-grad-aurora shadow-soft sm:col-span-2"
              aria-label="grad-aurora"
            />
            <div className="grad-border-shell rounded-xl p-px sm:col-span-2">
              <div className="rounded-[calc(var(--radius-xl)-1px)] bg-card p-5">
                <p className="text-h4">کارت با حاشیهٔ گرادیانی</p>
                <p className="mt-1 text-body text-foreground-muted">
                  نمونهٔ --grad-border روی سطح توپر (نه شیشه‌ای).
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="typography"
          title="تایپوگرافی"
          lede="وزیرمتن خودمیزبان. ارتفاع خط برای فارسی بلندتر از لاتین تنظیم شده است."
        >
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
            <p className="text-display">نمایش · برقینو</p>
            <p className="text-h1">عنوان یک · فروش برق خانگی</p>
            <p className="text-h2">عنوان دو · نیروگاه خورشیدی</p>
            <p className="text-h3">عنوان سه · قرارداد شفاف</p>
            <p className="text-h4">عنوان چهار · وضعیت درخواست</p>
            <p className="text-body">
              متن بدنه: مسیر فروش برق از نیروگاه خانگی، بدون وعدهٔ درآمد تضمینی. اعداد نمونه:{" "}
              <span className="tabular-nums">{formatFa(15000)}</span> تومان/کیلووات‌ساعت.
            </p>
            <p className="text-caption text-foreground-muted">کپشن · برچسب کمکی و راهنما</p>
            <p className="text-nav">ناوبری · {formatFa(15)}px</p>
          </div>
        </Section>

        <Section id="radius" title="شعاع گوشه" lede="sm تا xl و pill — گوشه‌های درشت مشخصهٔ Solar Aurora.">
          <div className="flex flex-wrap items-end gap-4">
            {radii.map((item) => (
              <div key={item.label} className="space-y-2 text-center">
                <div
                  className={cx(
                    "size-20 border border-border bg-sun-100 shadow-soft dark:bg-sun-900/40",
                    item.className,
                  )}
                />
                <p className="text-caption text-foreground-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="shadows" title="سایه‌ها" lede="نرم، بلند، و درخشش رنگی خورشید/انرژی/ولت.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {shadows.map((item) => (
              <div
                key={item.label}
                className={cx(
                  "rounded-lg border border-border bg-card p-6 text-center text-caption",
                  item.className,
                )}
              >
                {item.label}
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="glass"
          title="شیشه روی شفق"
          lede="گلس فقط روی پس‌زمینهٔ رنگی. بدون backdrop-filter، fallback توپر اعمال می‌شود."
        >
          <div className="relative overflow-hidden rounded-xl bg-grad-sun p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-80" />
            <div className="relative grid gap-4 sm:grid-cols-3">
              <div className="glass rounded-lg p-5">
                <p className="text-h4">.glass</p>
                <p className="mt-2 text-caption text-foreground-muted">بلور استاندارد</p>
              </div>
              <div className="glass-strong rounded-lg p-5">
                <p className="text-h4">.glass-strong</p>
                <p className="mt-2 text-caption text-foreground-muted">کدرتر برای خوانایی</p>
              </div>
              <div className="glass-solid-fallback rounded-lg p-5">
                <p className="text-h4">.glass-solid-fallback</p>
                <p className="mt-2 text-caption text-foreground-muted">بدون blur</p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="surfaces"
          title="سطح داده در برابر لایه"
          lede="جداول و فرم‌ها توپر می‌مانند؛ گلس برای هدر، مودال و پنل شناور."
        >
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
            <table className="w-full text-start text-sm">
              <thead className="bg-surface-2 text-foreground-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">وضعیت</th>
                  <th className="px-4 py-3 font-semibold">مقدار نمونه</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">فعال</td>
                  <td className="px-4 py-3">
                    <span dir="ltr" className="tabular-nums">
                      {formatFa(1284)} kWh
                    </span>
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">در انتظار</td>
                  <td className="px-4 py-3 tabular-nums">{formatFa(42)} روز</td>
                </tr>
              </tbody>
            </table>
            <p className="border-t border-border px-4 py-3 text-caption text-foreground-muted">
              جدول نمونه · اعداد نمایشی‌اند
            </p>
          </div>
        </Section>

        <div className="section-fade border-t border-transparent pt-16">
          <header className="mb-10 space-y-2">
            <p className="text-caption text-accent">components/ui</p>
            <h2 className="text-display">کامپوننت‌های پایه</h2>
            <p className="max-w-3xl text-body text-foreground-muted">
              همهٔ حالت‌ها با توکن‌های Solar Aurora. API کوچک و یکدست از{" "}
              <code className="rounded-sm bg-surface px-1.5 py-0.5 text-caption">@/components/ui</code>.
            </p>
          </header>
          <ComponentsPreview />
        </div>
      </main>
    </div>
  );
}
