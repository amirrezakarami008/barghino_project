"use client";

import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";
import { Alert, Button, EmptyState, Skeleton, StatCard } from "@/components/ui";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { AdminPage, AdminSolidSurface } from "./admin-page";
import { getQueueCounts } from "./reviews-api";
import { usePlanOverview } from "./use-plan-overview";

type Guide = { readonly slug: string; readonly title: string; readonly minutes: number };

type QueueState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly branches: number; readonly plants: number; readonly contracts: number };

export function AdminDashboard({ guides }: { readonly guides: readonly Guide[] }): ReactElement {
  const { overview, retry: retryPlans } = usePlanOverview();
  const [queues, setQueues] = useState<QueueState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setQueues({ status: "loading" });
    void getQueueCounts(controller.signal)
      .then((counts) => {
        if (!controller.signal.aborted) setQueues({ status: "ready", ...counts });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setQueues({ status: "error", message: "دریافت شمارندهٔ صف بررسی انجام نشد." });
        }
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <AdminPage
      title="نمای کلی"
      description="صف‌های در انتظار بررسی، خلاصهٔ پلن‌ها و دسترسی به راهنماها — بدون نمودار ساختگی تولید یا حسابداری."
      action={{ href: "/admin/reviews", label: "رفتن به صف بررسی", icon: "shield" }}
    >
      <section aria-label="صف‌های در انتظار" className="grid gap-3 sm:grid-cols-3">
        {queues.status === "loading" ? (
          <>
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </>
        ) : queues.status === "error" ? (
          <Alert tone="danger" className="sm:col-span-3" title="خطا در دریافت صف">
            <p>{queues.message}</p>
            <Button variant="secondary" className="mt-2" onClick={() => setAttempt((value) => value + 1)}>
              تلاش دوباره
            </Button>
          </Alert>
        ) : (
          <>
            <QueueStat
              href="/admin/reviews"
              label="انشعاب‌های در انتظار"
              value={queues.branches}
              hint="برای تأیید یا رد"
            />
            <QueueStat
              href="/admin/reviews"
              label="نیروگاه‌های در انتظار"
              value={queues.plants}
              hint="پس از تأیید انشعاب"
            />
            <QueueStat
              href="/admin/reviews"
              label="قراردادهای امضاشده"
              value={queues.contracts}
              hint="در انتظار تأیید نهایی"
            />
          </>
        )}
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminSolidSurface className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-h4">وضعیت پلن‌های فروش</h3>
            <Link href="/admin/plans" className="text-sm font-semibold text-sun-800 hover:underline dark:text-sun-200">
              مدیریت پلن‌ها
            </Link>
          </div>
          {overview.status === "loading" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          ) : overview.status === "error" ? (
            <Alert tone="danger" title="دریافت پلن‌ها انجام نشد">
              <Button variant="secondary" className="mt-2" onClick={retryPlans}>
                تلاش دوباره
              </Button>
            </Alert>
          ) : overview.total === 0 ? (
            <EmptyState
              title="هنوز پلنی تعریف نشده"
              description="نرخ خرید، تعهد انرژی و مزایا را در بخش پلن‌ها مشخص کنید."
              icon="plan"
              action={
                <Link href="/admin/plans" className="text-sm font-semibold text-sun-800 underline dark:text-sun-200">
                  تعریف اولین پلن
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="کل پلن‌ها" value={faNumber(overview.total)} hint="تعریف‌شده در کاتالوگ" />
              <StatCard label="فعال" value={faNumber(overview.active)} hint="قابل انتخاب در قرارداد" />
              <StatCard label="پیشنهادی" value={faNumber(overview.recommended)} hint="برجسته‌شده برای مشتری" />
            </div>
          )}
        </AdminSolidSurface>

        <AdminSolidSurface className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-h4">راهنماها</h3>
            <Link href="/admin/journal" className="text-sm font-semibold text-sun-800 hover:underline dark:text-sun-200">
              فهرست کامل
            </Link>
          </div>
          {guides.length === 0 ? (
            <p className="text-sm text-foreground-muted">راهنمای منتشرشده‌ای ثبت نشده است.</p>
          ) : (
            <ul className="space-y-2">
              {guides.slice(0, 4).map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/blog/${guide.slug}`}
                    className="flex items-start justify-between gap-2 rounded-md px-2 py-2 text-sm hover:bg-surface"
                  >
                    <span className="font-medium">{guide.title}</span>
                    <span className="shrink-0 text-caption text-foreground-muted">{faNumber(guide.minutes)} دقیقه</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminSolidSurface>
      </section>

      <AdminSolidSurface className="p-4">
        <h3 className="mb-3 text-h4">میانبرها</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { href: "/admin/reviews", label: "صف بررسی", icon: "shield" as const },
              { href: "/admin/plans", label: "پلن‌های فروش", icon: "plan" as const },
              { href: "/admin/plants", label: "نیروگاه‌ها", icon: "solarPanel" as const },
              { href: "/admin/journal", label: "راهنماها", icon: "book" as const },
            ] as const
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-semibold hover:border-energy-300"
            >
              <Icon name={item.icon} className="size-4 text-foreground-muted" />
              {item.label}
            </Link>
          ))}
        </div>
      </AdminSolidSurface>
    </AdminPage>
  );
}

function QueueStat({
  href,
  label,
  value,
  hint,
}: {
  href: string;
  label: string;
  value: number;
  hint: string;
}): ReactElement {
  return (
    <Link href={href} className="block rounded-lg border border-border bg-card p-4 shadow-soft transition-colors hover:border-energy-300">
      <p className="text-caption text-foreground-muted">{label}</p>
      <p className="mt-2 text-display tabular-nums text-foreground">{faNumber(value)}</p>
      <p className="mt-1 text-caption text-foreground-muted">{hint}</p>
    </Link>
  );
}
