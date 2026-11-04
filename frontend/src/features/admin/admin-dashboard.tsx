"use client";

import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Alert, Button, ButtonLink, EmptyState, Skeleton } from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { getQueueCounts } from "./reviews-api";
import { usePlanOverview } from "./use-plan-overview";
import "./admin-workspace.css";

type Guide = { readonly slug: string; readonly title: string; readonly minutes: number };

type QueueState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | {
      readonly status: "ready";
      readonly branches: number;
      readonly plants: number;
      readonly contracts: number;
      readonly renewals: number;
    };

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function AdminDashboard({ guides }: { readonly guides: readonly Guide[] }): ReactElement {
  const reduceMotion = useReducedMotion();
  const { overview, retry: retryPlans } = usePlanOverview();
  const [queues, setQueues] = useState<QueueState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => setQueues({ status: "loading" }));
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

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <motion.div className="admin-workspace" {...motionProps}>
      <motion.section className="admin-ws-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div className="min-w-0">
          <p className="admin-ws-hero-eyebrow">میز عملیات</p>
          <h2 className="admin-ws-hero-title">نمای کلی مدیریت</h2>
          <p className="admin-ws-hero-body">
            صف‌های واقعی بررسی، خلاصهٔ پلن‌ها و میانبرها — بدون نمودار ساختگی تولید یا حسابداری.
          </p>
          <div className="mt-4">
            <ButtonLink href="/admin/reviews" className="admin-ws-hero-cta">
              <Icon name="shield" className="size-4" />
              رفتن به صف بررسی
            </ButtonLink>
          </div>
        </div>
        <div className="admin-ws-hero-art">
          <PanelArt name="hero-solar" width={280} height={280} className="admin-ws-hero-image" />
        </div>
      </motion.section>

      <motion.section aria-label="صف‌های در انتظار" variants={reduceMotion ? undefined : fadeUp}>
        {queues.status === "loading" ? (
          <div className="admin-ws-stats">
            <Skeleton className="h-28 rounded-[22px]" />
            <Skeleton className="h-28 rounded-[22px]" />
            <Skeleton className="h-28 rounded-[22px]" />
            <Skeleton className="h-28 rounded-[22px]" />
          </div>
        ) : queues.status === "error" ? (
          <Alert tone="danger" title="خطا در دریافت صف">
            <p>{queues.message}</p>
            <Button variant="secondary" className="mt-2" onClick={() => setAttempt((value) => value + 1)}>
              تلاش دوباره
            </Button>
          </Alert>
        ) : (
          <div className="admin-ws-stats">
            <Link href="/admin/reviews" className="admin-ws-stat">
              <span>انشعاب‌ها</span>
              <strong>{faNumber(queues.branches)}</strong>
              <em>در انتظار تأیید یا رد</em>
            </Link>
            <Link href="/admin/reviews?tab=plants" className="admin-ws-stat">
              <span>نیروگاه‌ها</span>
              <strong>{faNumber(queues.plants)}</strong>
              <em>در صف بررسی شرکت</em>
            </Link>
            <Link href="/admin/reviews?tab=contracts" className="admin-ws-stat">
              <span>قراردادها</span>
              <strong>{faNumber(queues.contracts)}</strong>
              <em>امضاشده، منتظر تأیید نهایی</em>
            </Link>
            <Link href="/admin/reviews?tab=renewals" className="admin-ws-stat">
              <span>تمدیدها</span>
              <strong>{faNumber(queues.renewals)}</strong>
              <em>درخواست تمدید یک‌ساله</em>
            </Link>
          </div>
        )}
      </motion.section>

      <motion.section className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" variants={reduceMotion ? undefined : fadeUp}>
        <div className="admin-ws-panel">
          <div className="admin-ws-panel-head">
            <h3>پلن‌های فروش</h3>
            <Link href="/admin/plans" className="admin-ws-link">
              مدیریت پلن‌ها
            </Link>
          </div>
          {overview.status === "loading" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-[18px]" />
              <Skeleton className="h-24 rounded-[18px]" />
              <Skeleton className="h-24 rounded-[18px]" />
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
                <Link href="/admin/plans" className="admin-ws-link">
                  تعریف اولین پلن
                </Link>
              }
            />
          ) : (
            <div className="admin-ws-stats" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              <div className="admin-ws-stat">
                <span>کل پلن‌ها</span>
                <strong>{faNumber(overview.total)}</strong>
                <em>تعریف‌شده در کاتالوگ</em>
              </div>
              <div className="admin-ws-stat">
                <span>فعال</span>
                <strong>{faNumber(overview.active)}</strong>
                <em>قابل انتخاب در قرارداد</em>
              </div>
              <div className="admin-ws-stat">
                <span>پیشنهادی</span>
                <strong>{faNumber(overview.recommended)}</strong>
                <em>برجسته‌شده برای مشتری</em>
              </div>
            </div>
          )}
        </div>

        <div className="admin-ws-panel">
          <div className="admin-ws-panel-head">
            <h3>راهنماها</h3>
            <Link href="/admin/journal" className="admin-ws-link">
              فهرست کامل
            </Link>
          </div>
          {guides.length === 0 ? (
            <p className="text-sm text-foreground-muted">راهنمای منتشرشده‌ای ثبت نشده است.</p>
          ) : (
            <ul className="admin-ws-guide-list">
              {guides.slice(0, 4).map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/blog/${guide.slug}`} className="admin-ws-guide-item">
                    <strong>{guide.title}</strong>
                    <span>{faNumber(guide.minutes)} دقیقه</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.section>

      <motion.section className="admin-ws-panel" variants={reduceMotion ? undefined : fadeUp}>
        <div className="admin-ws-panel-head">
          <h3>میانبرها</h3>
        </div>
        <div className="admin-ws-shortcuts">
          {(
            [
              { href: "/admin/reviews", label: "صف بررسی", icon: "shield" as const },
              { href: "/admin/plans", label: "پلن‌های فروش", icon: "plan" as const },
              { href: "/admin/plants", label: "نیروگاه‌ها", icon: "solarPanel" as const },
              { href: "/admin/journal", label: "راهنماها", icon: "book" as const },
            ] as const
          ).map((item) => (
            <Link key={item.href} href={item.href} className="admin-ws-shortcut">
              <Icon name={item.icon} className="size-4 text-foreground-muted" />
              {item.label}
            </Link>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
