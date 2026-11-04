"use client";

import { useCallback, useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Button,
  ButtonLink,
  EmptyState,
  Skeleton,
  StatusPill,
} from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/cn";
import { schemeTypeLabel, systemTypeLabel } from "@/features/plants/plant-options";
import { getContracts } from "./contracts-api";
import {
  contractActionLabel,
  contractDisplayTitle,
  formatDecimal,
  localDate,
  sellerDisplayName,
  type Contract,
} from "./contract-model";
import { contractStatusMeta } from "./status-map";
import { useContractResource } from "./use-contract-resource";
import { ContractError, ContractPagination } from "./contract-ui";
import "./contracts-workspace.css";

const FILTERS = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "pending", label: "در انتظار بررسی شرکت" },
  { value: "active", label: "فعال" },
  { value: "cancelled", label: "بسته‌شده" },
  { value: "expired", label: "منقضی" },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export function ContractsList(): ReactElement {
  const search = useSearchParams();
  const reduceMotion = useReducedMotion();
  const initialFilter = FILTERS.some((item) => item.value === search.get("status"))
    ? (search.get("status") as (typeof FILTERS)[number]["value"])
    : "all";
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>(initialFilter);
  const load = useCallback((signal: AbortSignal) => getContracts(page, signal), [page]);
  const { state, reload, refreshing } = useContractResource(`contracts:${page}`, load);

  const rows = useMemo(() => {
    if (state.status !== "ready") return [];
    if (filter === "all") return state.data.results;
    return state.data.results.filter((item) => item.status === filter);
  }, [filter, state]);

  const pageCounts = useMemo(() => {
    if (state.status !== "ready") {
      return { draft: 0, pending: 0, active: 0, closed: 0 };
    }
    const results = state.data.results;
    return {
      draft: results.filter((item) => item.status === "draft").length,
      pending: results.filter((item) => item.status === "pending").length,
      active: results.filter((item) => item.status === "active").length,
      closed: results.filter((item) => item.status === "cancelled" || item.status === "expired").length,
    };
  }, [state]);

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.07 } },
        },
      };

  return (
    <motion.div className="contracts-workspace" {...motionProps}>
      <motion.header variants={reduceMotion ? undefined : fadeUp}>
        <p className="contracts-kicker">مدیریت قرارداد</p>
        <h2 className="text-h2 tracking-tight">قراردادهای من</h2>
        <p className="mt-2 max-w-2xl text-body text-foreground-muted">
          پیش‌نویس‌ها و قراردادهای واقعی حساب شما — با وضعیت شفاف و بدون عدد ساختگی.
        </p>
      </motion.header>

      <motion.section className="contracts-hero" variants={reduceMotion ? undefined : fadeUp} aria-label="شروع قرارداد">
        <div>
          <p className="contracts-hero-eyebrow">فضای قرارداد خورشیدی</p>
          <h3 className="contracts-hero-title">پلن را انتخاب کنید و پیش‌نویس بسازید</h3>
          <p className="contracts-hero-body">
            مسیر از ثبت انشعاب و نیروگاه آغاز می‌شود. ساخت پیش‌نویس به‌معنی امضا یا شروع خرید برق نیست.
          </p>
          <ButtonLink href="/panel/contracts/new" className="contracts-hero-cta mt-5">
            <Icon name="plus" className="size-4" />
            قرارداد جدید
            <Icon name="arrow" className="size-4 -scale-x-100" />
          </ButtonLink>
        </div>
        <div className="contracts-hero-art" aria-hidden>
          <PanelArt name="contracts/hero" width={720} height={405} className="contracts-hero-image" priority />
          <PanelArt name="contracts/decor" width={120} height={120} className="contracts-hero-orb" />
        </div>
      </motion.section>

      <section aria-label="خلاصه وضعیت" className="contracts-stat-grid">
        {state.status === "loading" ? (
          <>
            <Skeleton className="h-36 rounded-[22px]" />
            <Skeleton className="h-36 rounded-[22px]" />
            <Skeleton className="h-36 rounded-[22px]" />
            <Skeleton className="h-36 rounded-[22px]" />
          </>
        ) : (
          <>
            <SummaryCard
              label="کل قراردادها"
              value={state.status === "ready" ? faNumber(state.data.count) : "—"}
              hint="مجموع حساب شما"
              art="stat-contracts"
              tone="volt"
              onSelect={() => setFilter("all")}
              reduceMotion={Boolean(reduceMotion)}
            />
            <SummaryCard
              label="پیش‌نویس‌ها"
              value={state.status === "ready" ? faNumber(pageCounts.draft) : "—"}
              hint="در صفحهٔ فعلی فهرست"
              art="stat-drafts"
              tone="sun"
              onSelect={() => setFilter("draft")}
              reduceMotion={Boolean(reduceMotion)}
            />
            <SummaryCard
              label="در انتظار بررسی"
              value={state.status === "ready" ? faNumber(pageCounts.pending) : "—"}
              hint="در صفحهٔ فعلی فهرست"
              art="contracts/pending"
              tone="sky"
              onSelect={() => setFilter("pending")}
              reduceMotion={Boolean(reduceMotion)}
            />
            <SummaryCard
              label="فعال"
              value={state.status === "ready" ? faNumber(pageCounts.active) : "—"}
              hint="در صفحهٔ فعلی فهرست"
              art="contracts/approved"
              tone="mint"
              onSelect={() => setFilter("active")}
              reduceMotion={Boolean(reduceMotion)}
            />
          </>
        )}
      </section>

      <motion.div className="contracts-toolbar" variants={reduceMotion ? undefined : fadeUp}>
        <div className="contracts-toolbar-filters" role="tablist" aria-label="فیلتر وضعیت">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              className={cn(
                "contracts-filter shrink-0",
                filter === item.value ? "contracts-filter--active" : "contracts-filter--idle",
              )}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" disabled={refreshing} onClick={reload} className="shrink-0">
          {refreshing ? "در حال دریافت…" : "تازه‌سازی"}
        </Button>
      </motion.div>

      {state.status === "loading" ? (
        <div className="grid gap-3">
          <Skeleton className="h-36 rounded-[22px]" />
          <Skeleton className="h-36 rounded-[22px]" />
          <Skeleton className="h-36 rounded-[22px]" />
        </div>
      ) : state.status === "error" ? (
        <ContractError message={state.message} retry={reload} />
      ) : !rows.length ? (
        <motion.div className="contracts-empty" variants={reduceMotion ? undefined : fadeUp}>
          <PanelArt
            name={filter === "all" ? "empty-contracts" : filter === "pending" ? "contracts/pending" : filter === "active" ? "contracts/approved" : filter === "cancelled" || filter === "expired" ? "contracts/rejected" : "stat-drafts"}
            width={180}
            height={180}
            className="contracts-empty-art"
          />
          <EmptyState
            hideIcon
            className="border-0 bg-transparent p-0 shadow-none"
            title={filter === "all" ? "هنوز قراردادی ندارید" : "موردی با این فیلتر نیست"}
            description="مسیر از ثبت انشعاب و نیروگاه تا ساخت پیش‌نویس ادامه دارد."
            action={<ButtonLink href="/panel/contracts/new">شروع قرارداد</ButtonLink>}
          />
        </motion.div>
      ) : (
        <ul className="contracts-ticket-list">
          {rows.map((contract) => (
            <motion.li key={contract.uuid} variants={reduceMotion ? undefined : fadeUp}>
              <ContractCard contract={contract} />
            </motion.li>
          ))}
        </ul>
      )}

      {state.status === "ready" ? (
        <ContractPagination
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
  onSelect,
  reduceMotion,
}: {
  label: string;
  value: string;
  hint: string;
  art: string;
  tone: "sun" | "mint" | "volt" | "coral" | "sky";
  onSelect: () => void;
  reduceMotion: boolean;
}) {
  return (
    <motion.button
      type="button"
      variants={reduceMotion ? undefined : fadeUp}
      className={cn("contracts-stat-card", `contracts-stat-card--${tone}`, "w-full text-start")}
      onClick={onSelect}
    >
      <div>
        <p className="text-caption text-foreground-muted">{label}</p>
        <p className="contracts-stat-value tabular-nums">{value}</p>
        <p className="mt-1 text-caption text-foreground-muted">{hint}</p>
      </div>
      <PanelArt name={art} width={112} height={112} className="contracts-stat-art" />
    </motion.button>
  );
}

function ContractCard({ contract }: { contract: Contract }) {
  const meta = contractStatusMeta(contract.status);
  const title = contractDisplayTitle(contract);
  const seller = sellerDisplayName(contract.seller);
  const stageClass =
    contract.status === "draft"
      ? "contracts-ticket--draft"
      : contract.status === "pending"
        ? "contracts-ticket--pending"
        : contract.status === "active"
          ? "contracts-ticket--active"
          : contract.status === "cancelled" || contract.status === "expired"
            ? "contracts-ticket--closed"
            : undefined;
  const art =
    contract.status === "active"
      ? "contracts/approved"
      : contract.status === "pending"
        ? "contracts/pending"
        : contract.status === "cancelled" || contract.status === "expired"
          ? "contracts/rejected"
          : "stat-drafts";
  const chips = [
    contract.schemeType ? schemeTypeLabel(contract.schemeType) : "",
    contract.systemType ? systemTypeLabel(contract.systemType) : "",
    contract.planName,
  ].filter(Boolean);

  return (
    <Link
      href={`/panel/contracts/${encodeURIComponent(contract.uuid)}`}
      className={cn("contracts-ticket", stageClass)}
    >
      <div className="contracts-ticket-top">
        <div className="min-w-0">
          <div className="contracts-ticket-kicker">
            <StatusPill status={meta.tone} label={meta.label} />
            <span className="contracts-ticket-date">
              {localDate(contract.reviewedAt || contract.signedAt || contract.createdAt)}
            </span>
          </div>
          <h3 className="contracts-ticket-title">{title}</h3>
          {chips.length ? (
            <div className="contracts-ticket-chips" aria-label="مشخصات طرح">
              {chips.map((chip) => (
                <span key={chip} className="contracts-ticket-chip">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          <p className="contracts-ticket-hint">{meta.next}</p>
        </div>
        <PanelArt name={art} width={96} height={96} className="contracts-ticket-art" />
      </div>

      <div className="contracts-ticket-body">
        <div className="contracts-ticket-metrics" aria-label="اعداد قرارداد">
          <div className="contracts-ticket-metric contracts-ticket-metric--hero">
            <span>ظرفیت نیروگاه</span>
            <strong>
              <bdi dir="ltr">{formatDecimal(contract.capacity)}</bdi>
            </strong>
            <em>کیلووات‌پیک</em>
          </div>
          <div className="contracts-ticket-metric">
            <span>نرخ توافقی</span>
            <strong>
              <bdi dir="ltr">{formatDecimal(contract.rate)}</bdi>
            </strong>
            <em>تومان / kWh</em>
          </div>
          <div className="contracts-ticket-metric">
            <span>تعهد انرژی</span>
            <strong>
              <bdi dir="ltr">{formatDecimal(contract.commitment)}</bdi>
            </strong>
            <em>کیلووات‌ساعت</em>
          </div>
        </div>

        <div className="contracts-ticket-facts">
          {contract.billId ? (
            <div className="contracts-ticket-fact">
              <span className="contracts-ticket-fact-icon" aria-hidden>
                <Icon name="bolt" className="size-4" />
              </span>
              <p>
                <span className="label">شناسه قبض</span>
                <span className="value dir-ltr text-start block tabular-nums">
                  <bdi dir="ltr">{contract.billId}</bdi>
                </span>
              </p>
            </div>
          ) : null}
          {contract.address ? (
            <div className="contracts-ticket-fact">
              <span className="contracts-ticket-fact-icon contracts-ticket-fact-icon--mint" aria-hidden>
                <Icon name="home" className="size-4" />
              </span>
              <p>
                <span className="label">نشانی انشعاب</span>
                <span className="value contracts-ticket-fact-value--wrap">{contract.address}</span>
              </p>
            </div>
          ) : null}
          {seller ? (
            <div className="contracts-ticket-fact">
              <span className="contracts-ticket-fact-icon contracts-ticket-fact-icon--sky" aria-hidden>
                <Icon name="user" className="size-4" />
              </span>
              <p>
                <span className="label">فروشنده</span>
                <span className="value block">{seller}</span>
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="contracts-ticket-foot">
        <p className="contracts-ticket-id">
          {contract.contractNumber
            ? <>شماره قرارداد · <bdi dir="ltr">{contract.contractNumber}</bdi></>
            : <>شناسه · <bdi dir="ltr">{contract.uuid.slice(0, 8)}…</bdi></>}
        </p>
        <span className="contracts-ticket-cta">
          {contractActionLabel(contract.status)}
          <Icon name="arrow" className="size-3.5 -scale-x-100" />
        </span>
      </div>
    </Link>
  );
}
