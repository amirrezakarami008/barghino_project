"use client";

import { useCallback, useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button, ButtonLink, EmptyState, Skeleton, StatusPill } from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/cn";
import { formatIranMobile } from "@/features/auth/lib/phone";
import { getInstallRequests } from "./installs-api";
import { formatArea, localDate, type InstallRequest } from "./install-model";
import { installStatusMeta } from "./status-map";
import { useInstallResource } from "./use-install-resource";
import { InstallError, InstallPagination } from "./install-ui";
import "./installs-workspace.css";

const FILTERS = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "submitted", label: "ارسال‌شده" },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function InstallsList(): ReactElement {
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");
  const load = useCallback((signal: AbortSignal) => getInstallRequests(page, signal), [page]);
  const { state, reload, refreshing } = useInstallResource(`installs:${page}`, load);

  const rows = useMemo(() => {
    if (state.status !== "ready") return [];
    if (filter === "all") return state.data.results;
    return state.data.results.filter((item) => item.stage === filter);
  }, [filter, state]);

  const counts = useMemo(() => {
    if (state.status !== "ready") return { all: 0, draft: 0, submitted: 0 };
    const results = state.data.results;
    return {
      all: state.data.count,
      draft: results.filter((item) => item.stage === "draft").length,
      submitted: results.filter((item) => item.stage === "submitted").length,
    };
  }, [state]);

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        },
      };

  return (
    <motion.div className="installs-workspace" {...motionProps}>
      <motion.section className="installs-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div className="min-w-0">
          <p className="installs-hero-eyebrow">مسیر نصب نیروگاه</p>
          <h2 className="installs-hero-title">درخواست نصب نیروگاه خورشیدی</h2>
          <p className="installs-hero-body">
            نشانی، مساحت و تصاویر محل را ثبت کنید تا تیم برقینو امکان‌سنجی نصب را آغاز کند.
          </p>
          <div className="mt-4">
            <ButtonLink href="/panel/install/new" className="installs-hero-cta">
              <Icon name="plus" className="size-4" />
              ثبت درخواست نصب نیروگاه
            </ButtonLink>
          </div>
        </div>
        <div className="installs-hero-art">
          <PanelArt name="installs/hero" width={320} height={320} className="installs-hero-image" />
        </div>
      </motion.section>

      <motion.header className="installs-page-header" variants={reduceMotion ? undefined : fadeUp}>
        <div className="min-w-0">
          <h2 className="text-h2 tracking-tight">درخواست‌های نصب من</h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-foreground-muted">
            هر درخواست مثل پروندهٔ محل نصب است؛ وضعیت، مساحت و مسیر بعدی را یک‌جا ببینید.
          </p>
        </div>
        <ButtonLink href="/panel/install/new" className="shrink-0">
          <Icon name="plus" className="size-4" />
          درخواست جدید
        </ButtonLink>
      </motion.header>

      <motion.section className="installs-summary-grid" variants={reduceMotion ? undefined : fadeUp} aria-label="خلاصه وضعیت">
        <SummaryCard
          label="همه درخواست‌ها"
          value={state.status === "ready" ? faNumber(counts.all) : "—"}
          hint="کل پرونده‌های ثبت‌شده"
          art="installs/document"
          tone="sun"
          active={filter === "all"}
          onSelect={() => setFilter("all")}
        />
        <SummaryCard
          label="پیش‌نویس"
          value={state.status === "ready" ? faNumber(counts.draft) : "—"}
          hint="نیاز به تکمیل یا ارسال"
          art="installs/location"
          tone="sky"
          active={filter === "draft"}
          onSelect={() => setFilter("draft")}
        />
        <SummaryCard
          label="ارسال‌شده"
          value={state.status === "ready" ? faNumber(counts.submitted) : "—"}
          hint="در صف بررسی شرکت"
          art="installs/success"
          tone="mint"
          active={filter === "submitted"}
          onSelect={() => setFilter("submitted")}
        />
      </motion.section>

      <motion.div className="installs-toolbar" variants={reduceMotion ? undefined : fadeUp}>
        <div className="installs-toolbar-filters" role="tablist" aria-label="فیلتر وضعیت">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              className={cn(
                "installs-filter shrink-0",
                filter === item.value ? "installs-filter--active" : "installs-filter--idle",
              )}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" disabled={refreshing} onClick={reload} className="shrink-0">
          {refreshing ? "در حال دریافت…" : "تازه‌سازی"}
        </Button>
      </motion.div>

      {state.status === "loading" ? (
        <div className="installs-list">
          <Skeleton className="h-44 rounded-[26px]" />
          <Skeleton className="h-44 rounded-[26px]" />
        </div>
      ) : state.status === "error" ? (
        <InstallError message={state.message} retry={reload} />
      ) : !rows.length ? (
        <motion.div className="installs-empty" variants={reduceMotion ? undefined : fadeUp}>
          <PanelArt
            name={filter === "all" ? "installs/empty" : "installs/document"}
            width={180}
            height={180}
            className="installs-empty-art"
          />
          <EmptyState
            hideIcon
            className="border-0 bg-transparent p-0 shadow-none"
            title={filter === "all" ? "هنوز درخواست نصبی ندارید" : "موردی با این فیلتر نیست"}
            description="اولین درخواست نصب را ثبت کنید تا بررسی محل و امکان‌سنجی آغاز شود."
            action={<ButtonLink href="/panel/install/new">ثبت اولین درخواست</ButtonLink>}
          />
        </motion.div>
      ) : (
        <ul className="installs-list">
          {rows.map((item) => (
            <motion.li key={item.uuid} variants={reduceMotion ? undefined : fadeUp}>
              <InstallCard request={item} />
            </motion.li>
          ))}
        </ul>
      )}

      {state.status === "ready" ? (
        <InstallPagination
          page={page}
          count={state.data.count}
          next={state.data.next}
          previous={state.data.previous}
          onChange={setPage}
        />
      ) : null}
    </motion.div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  art,
  tone,
  active,
  onSelect,
}: {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly art: string;
  readonly tone: "sun" | "sky" | "mint";
  readonly active: boolean;
  readonly onSelect: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      className={cn(
        "installs-summary-card",
        `installs-summary-card--${tone}`,
        active && "installs-summary-card--active",
      )}
      onClick={onSelect}
      aria-pressed={active}
    >
      <div className="min-w-0">
        <p className="text-caption font-bold text-foreground-muted">{label}</p>
        <p className="installs-summary-value tabular-nums">{value}</p>
        <p className="mt-1 text-caption text-foreground-muted">{hint}</p>
      </div>
      <PanelArt name={art} width={88} height={88} className="installs-summary-art" />
    </button>
  );
}

function InstallCard({ request }: { readonly request: InstallRequest }): ReactElement {
  const meta = installStatusMeta(request.stage);
  const stageClass =
    request.stage === "draft"
      ? "installs-ticket--draft"
      : request.stage === "submitted"
        ? "installs-ticket--submitted"
        : undefined;
  const art =
    request.stage === "submitted"
      ? "installs/success"
      : request.stage === "draft"
        ? "installs/location"
        : "installs/document";
  const actionLabel = request.stage === "draft" ? "ادامه پرونده" : "باز کردن پرونده";

  return (
    <Link
      href={`/panel/install/${encodeURIComponent(request.uuid)}`}
      className={cn("installs-ticket", stageClass)}
    >
      <div className="installs-ticket-top">
        <div className="min-w-0">
          <div className="installs-ticket-kicker">
            <StatusPill status={meta.tone} label={meta.label} />
            <span className="installs-ticket-date">{localDate(request.createdAt)}</span>
          </div>
          <h3 className="installs-ticket-title">{request.address}</h3>
          <p className="installs-ticket-hint">{meta.next}</p>
        </div>
        <PanelArt name={art} width={96} height={96} className="installs-ticket-art" />
      </div>

      <div className="installs-ticket-body">
        <div className="installs-ticket-metric" aria-label="مساحت نصب">
          <span>مساحت قابل‌نصب</span>
          <strong>{formatArea(request.areaM2)}</strong>
          <em>متر مربع</em>
        </div>

        <div className="installs-ticket-facts">
          <div className="installs-ticket-fact">
            <span className="installs-ticket-fact-icon" aria-hidden>
              <Icon name="phone" className="size-4" />
            </span>
            <p>
              <span className="label">تماس هماهنگی</span>
              <span className="value dir-ltr text-start block tabular-nums">
                {formatIranMobile(request.phone)}
              </span>
            </p>
          </div>
          <div className="installs-ticket-fact">
            <span className="installs-ticket-fact-icon installs-ticket-fact-icon--mint" aria-hidden>
              <Icon name="solarPanel" className="size-4" />
            </span>
            <p>
              <span className="label">تصاویر محل</span>
              <span className="value block">
                {request.media.length
                  ? `${faNumber(request.media.length)} تصویر پیوست‌شده`
                  : "هنوز تصویری نیست"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="installs-ticket-foot">
        <span className="installs-ticket-id">
          شناسه · <bdi dir="ltr">{request.uuid.slice(0, 8)}…</bdi>
        </span>
        <span className="installs-ticket-cta">
          {actionLabel}
          <Icon name="arrow" className="size-3.5 rotate-180" />
        </span>
      </div>
    </Link>
  );
}
