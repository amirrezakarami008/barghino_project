"use client";

import { useCallback, useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Skeleton,
  StatusPill,
} from "@/components/ui";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";
import { getContracts } from "./contracts-api";
import { formatDecimal, localDate, type Contract } from "./contract-model";
import { contractStatusMeta } from "./status-map";
import { useContractResource } from "./use-contract-resource";
import { ContractError, ContractPagination } from "./contract-ui";

const FILTERS = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "pending", label: "در انتظار بررسی شرکت" },
  { value: "active", label: "فعال" },
  { value: "cancelled", label: "بسته‌شده" },
  { value: "expired", label: "منقضی" },
] as const;

export function ContractsList(): ReactElement {
  const search = useSearchParams();
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-h2">قراردادهای من</h2>
          <p className="mt-2 text-body text-foreground-muted">
            وضعیت واقعی هر پیش‌نویس و قرارداد — بدون عدد ساختگی.
          </p>
        </div>
        <ButtonLink href="/panel/contracts/new">
          <Icon name="plus" className="size-4" />
          قرارداد جدید
        </ButtonLink>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="فیلتر وضعیت">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            className={
              filter === item.value
                ? "min-h-11 rounded-pill bg-grad-sun px-4 text-sm font-semibold text-primary-foreground shadow-sun-glow"
                : "min-h-11 rounded-pill border border-border bg-card px-4 text-sm font-semibold text-foreground-muted hover:bg-surface"
            }
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
        <Button variant="ghost" size="sm" disabled={refreshing} onClick={reload}>
          {refreshing ? "در حال دریافت…" : "تازه‌سازی"}
        </Button>
      </div>

      {state.status === "loading" ? (
        <div className="grid gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : state.status === "error" ? (
        <ContractError message={state.message} retry={reload} />
      ) : !rows.length ? (
        <EmptyState
          title={filter === "all" ? "هنوز قراردادی ندارید" : "موردی با این فیلتر نیست"}
          description="مسیر از ثبت انشعاب و نیروگاه تا ساخت پیش‌نویس ادامه دارد."
          action={<ButtonLink href="/panel/contracts/new">شروع قرارداد</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-3">
          {rows.map((contract) => (
            <ContractCard key={contract.uuid} contract={contract} />
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
    </div>
  );
}

function ContractCard({ contract }: { contract: Contract }) {
  const meta = contractStatusMeta(contract.status);
  return (
    <li>
      <Card variant="interactive" className="p-0">
        <Link
          href={`/panel/contracts/${encodeURIComponent(contract.uuid)}`}
          className="block rounded-lg p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="text-h4">{contract.plantName || "نیروگاه ثبت نشده"}</h3>
              <p className="text-sm text-foreground-muted">{contract.planName || "پلن ثبت نشده"}</p>
            </div>
            <StatusPill status={meta.tone} label={meta.label} />
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-caption text-foreground-muted">نرخ ذخیره‌شده</dt>
              <dd className="tabular-nums font-semibold">
                <bdi dir="ltr">{formatDecimal(contract.rate)}</bdi> تومان/kWh
              </dd>
            </div>
            <div>
              <dt className="text-caption text-foreground-muted">تعهد انرژی</dt>
              <dd className="tabular-nums font-semibold">
                <bdi dir="ltr">{formatDecimal(contract.commitment)}</bdi> kWh
              </dd>
            </div>
            <div>
              <dt className="text-caption text-foreground-muted">آخرین رویداد</dt>
              <dd>{localDate(contract.reviewedAt || contract.signedAt || contract.createdAt)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-caption text-foreground-muted">{meta.next}</p>
        </Link>
      </Card>
    </li>
  );
}
