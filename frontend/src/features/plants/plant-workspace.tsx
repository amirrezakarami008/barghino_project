"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  ButtonLink,
  EmptyState,
  Skeleton,
  StatusPill,
} from "@/components/ui";
import { formatDecimal } from "@/features/contracts";
import { plantStatusMeta } from "@/features/contracts/status-map";
import { PanelArt } from "@/features/panel/panel-art";
import { cn } from "@/shared/lib/cn";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { schemeTypeLabel, systemTypeLabel } from "./plant-options";
import { PlantTodayMetrics } from "./plant-today-metrics";
import { usePlantInventory } from "./use-plant-inventory";
import type { Plant } from "./plants-api";
import "./plants.css";

function plantStageClass(status: string): string | undefined {
  if (status === "active") return "plant-ticket--active";
  if (status === "pending") return "plant-ticket--pending";
  if (status === "inactive") return "plant-ticket--closed";
  if (status === "maintenance") return "plant-ticket--draft";
  return undefined;
}

function PlantCard({
  plant,
  branchName,
}: {
  readonly plant: Plant;
  readonly branchName: string | null;
}): ReactElement {
  const meta = plantStatusMeta(plant.status);

  return (
    <article className={cn("plant-ticket", plantStageClass(plant.status))}>
      <div className="plant-ticket-top">
        <div className="min-w-0">
          <div className="plant-ticket-kicker">
            <StatusPill status={meta.tone} label={meta.label} />
            <span className="plant-ticket-capacity tabular-nums">
              ظرفیت <bdi dir="ltr">{formatDecimal(plant.capacity_kwp)}</bdi> kWp
            </span>
          </div>
          <h3 className="plant-ticket-title">{plant.name}</h3>
          <div className="plant-ticket-chips" aria-label="مشخصات نیروگاه">
            <span className="plant-ticket-chip">{schemeTypeLabel(plant.scheme_type)}</span>
            <span className="plant-ticket-chip">{systemTypeLabel(plant.system_type)}</span>
          </div>
        </div>
        <PanelArt
          name="stat-plants"
          width={96}
          height={96}
          className="plant-ticket-art"
        />
      </div>

      <div className="plant-ticket-body">
        <PlantTodayMetrics plantUuid={plant.uuid} />

        <div className="plant-ticket-facts">
          {branchName ? (
            <div className="plant-ticket-fact">
              <span className="plant-ticket-fact-icon" aria-hidden>
                <Icon name="bolt" className="size-4" />
              </span>
              <p>
                <span className="label">انشعاب</span>
                <span className="value">{branchName}</span>
              </p>
            </div>
          ) : null}
          {plant.address ? (
            <div className="plant-ticket-fact">
              <span className="plant-ticket-fact-icon plant-ticket-fact-icon--mint" aria-hidden>
                <Icon name="home" className="size-4" />
              </span>
              <p>
                <span className="label">نشانی</span>
                <span className="value plant-ticket-fact-value--wrap">{plant.address}</span>
              </p>
            </div>
          ) : null}
        </div>

        {plant.review_note ? (
          <p className="plant-ticket-note">نتیجهٔ بررسی: {plant.review_note}</p>
        ) : null}
      </div>
    </article>
  );
}

export function PlantWorkspace(): ReactElement {
  const [page, setPage] = useState(1);
  const { state, reload } = usePlantInventory(1, page);

  return (
    <div className="panel-page space-y-6">
      <header className="panel-page-header flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-h2 tracking-tight">نیروگاه من</h2>
          <p className="mt-2 text-body text-foreground-muted">
            تولید و درآمد امروز، ظرفیت و وضعیت بررسی — فقط دادهٔ واقعی حساب شما.
          </p>
        </div>
        <Button variant="secondary" onClick={reload}>
          تازه‌سازی
        </Button>
      </header>

      {state.status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-[26px]" />
          <Skeleton className="h-64 rounded-[26px]" />
        </div>
      ) : state.status === "error" ? (
        <Alert tone="danger" title="دریافت نیروگاه‌ها ممکن نشد">
          <p>{state.message}</p>
          <Button variant="secondary" className="mt-3" onClick={reload}>
            تلاش دوباره
          </Button>
        </Alert>
      ) : !state.data.plants.results.length ? (
        <div className="panel-surface grid justify-items-center gap-3 py-8 text-center">
          <PanelArt
            name="stat-plants"
            width={160}
            height={160}
            className="size-36 rounded-[22px] object-cover shadow-[var(--panel-float)]"
          />
          <EmptyState
            hideIcon
            className="border-0 bg-transparent p-0 shadow-none"
            title="هنوز نیروگاهی ثبت نشده است"
            description="ابتدا انشعاب را تعریف کنید؛ سپس در مرحلهٔ بعد نیروگاه را روی همان انشعاب ثبت کنید."
            icon="solarPanel"
            action={<ButtonLink href="/panel/contracts/new">ثبت نیروگاه</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <p className="text-caption text-foreground-muted">
            {faNumber(state.data.plants.count)} نیروگاه ثبت‌شده
          </p>
          <ul className="plant-ticket-list">
            {state.data.plants.results.map((plant) => {
              const branch = state.data.branches.results.find((item) => item.uuid === plant.branch_uuid);
              return (
                <li key={plant.uuid}>
                  <PlantCard plant={plant} branchName={branch?.name ?? null} />
                </li>
              );
            })}
          </ul>
          {state.data.plants.next || state.data.plants.previous ? (
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                disabled={!state.data.plants.previous}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                قبلی
              </Button>
              <span className="text-caption">صفحهٔ {faNumber(page)}</span>
              <Button
                variant="ghost"
                disabled={!state.data.plants.next}
                onClick={() => setPage((current) => current + 1)}
              >
                بعدی
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
