"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Skeleton,
  StatusPill,
} from "@/components/ui";
import { formatDecimal } from "@/features/contracts";
import { plantStatusMeta } from "@/features/contracts/status-map";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { usePlantInventory } from "./use-plant-inventory";

export function PlantWorkspace(): ReactElement {
  const [page, setPage] = useState(1);
  const { state, reload } = usePlantInventory(1, page);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-h2">نیروگاه من</h2>
          <p className="mt-2 text-body text-foreground-muted">
            ظرفیت، نشانی و وضعیت بررسی — فقط دادهٔ واقعی حساب شما.
          </p>
        </div>
        <Button variant="secondary" onClick={reload}>
          تازه‌سازی
        </Button>
      </header>

      {state.status === "loading" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : state.status === "error" ? (
        <Alert tone="danger" title="دریافت نیروگاه‌ها ممکن نشد">
          <p>{state.message}</p>
          <Button variant="secondary" className="mt-3" onClick={reload}>
            تلاش دوباره
          </Button>
        </Alert>
      ) : !state.data.plants.results.length ? (
        <EmptyState
          title="هنوز نیروگاهی ثبت نشده است"
          description="ثبت انشعاب و نیروگاه در مسیر قرارداد جدید انجام می‌شود."
          icon="solarPanel"
          action={<ButtonLink href="/panel/contracts/new">شروع قرارداد</ButtonLink>}
        />
      ) : (
        <>
          <p className="text-caption text-foreground-muted">
            {faNumber(state.data.plants.count)} نیروگاه ثبت‌شده
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {state.data.plants.results.map((plant) => {
              const meta = plantStatusMeta(plant.status);
              const branch = state.data.branches.results.find((item) => item.uuid === plant.branch_uuid);
              return (
                <li key={plant.uuid}>
                  <Card className="h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <span className="grid size-11 place-items-center rounded-md bg-grad-energy text-secondary-foreground">
                          <Icon name="solarPanel" className="size-5" />
                        </span>
                        <div>
                          <h3 className="text-h4">{plant.name}</h3>
                          <p className="mt-1 text-sm tabular-nums text-foreground-muted">
                            ظرفیت · <bdi dir="ltr">{formatDecimal(plant.capacity_kwp)}</bdi> kWp
                          </p>
                        </div>
                      </div>
                      <StatusPill status={meta.tone} label={meta.label} />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-foreground-muted">{plant.address}</p>
                    {branch ? (
                      <p className="mt-2 text-caption text-foreground-muted">انشعاب: {branch.name}</p>
                    ) : null}
                    {plant.review_note ? (
                      <p className="mt-3 rounded-md bg-status-pending-bg px-3 py-2 text-sm text-status-pending">
                        نتیجهٔ بررسی: {plant.review_note}
                      </p>
                    ) : null}
                  </Card>
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
