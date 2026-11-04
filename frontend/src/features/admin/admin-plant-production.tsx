"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Alert, Button, Select } from "@/components/ui";
import { formatDecimal } from "@/features/contracts";
import { faNumber } from "@/shared/lib/fa";
import { formatJalaliDisplay, JalaliDateField } from "@/shared/ui/jalali-date-field";
import type { AdminPlant } from "./admin-plants-api";
import {
  getPlantProduction,
  plantTelemetryError,
  type ProductionBucket,
  type ProductionPoint,
} from "./admin-plant-telemetry-api";

type ChartState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly points: readonly ProductionPoint[] };

function bucketLabel(bucket: ProductionBucket): string {
  if (bucket === "week") return "هفته";
  if (bucket === "month") return "ماه";
  return "روز";
}

export function AdminPlantProductionPanel({
  plant,
}: {
  readonly plant: AdminPlant;
}): ReactElement {
  const [bucket, setBucket] = useState<ProductionBucket>("day");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ readonly key: string; readonly state: ChartState }>();
  const key = `${plant.uuid}:${bucket}:${periodFrom}:${periodTo}:${attempt}`;
  const state: ChartState = result?.key === key ? result.state : { status: "loading" };

  useEffect(() => {
    const controller = new AbortController();
    void getPlantProduction(
      plant.uuid,
      {
        bucket,
        periodFrom: periodFrom || undefined,
        periodTo: periodTo || undefined,
      },
      controller.signal,
    )
      .then((points) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", points } });
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: plantTelemetryError(failure) } });
        }
      });
    return () => controller.abort();
  }, [key, plant.uuid, bucket, periodFrom, periodTo, attempt]);

  const maxEnergy =
    state.status === "ready"
      ? state.points.reduce((max, point) => Math.max(max, Number(point.energyKwh) || 0), 0)
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Select
          label="باکت"
          value={bucket}
          onChange={(event) => setBucket(event.target.value as ProductionBucket)}
          options={[
            { value: "day", label: "روزانه" },
            { value: "week", label: "هفتگی" },
            { value: "month", label: "ماهانه" },
          ]}
        />
        <JalaliDateField
          label="از تاریخ (اختیاری)"
          value={periodFrom}
          onChange={setPeriodFrom}
        />
        <JalaliDateField
          label="تا تاریخ (اختیاری)"
          value={periodTo}
          onChange={setPeriodTo}
        />
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={() => setAttempt((value) => value + 1)}>
            تازه‌سازی
          </Button>
        </div>
      </div>

      {state.status === "loading" ? (
        <p className="text-sm text-foreground-muted">در حال بارگذاری نمودار تولید…</p>
      ) : state.status === "error" ? (
        <Alert tone="danger" title={state.message}>
          <Button variant="secondary" className="mt-2" onClick={() => setAttempt((value) => value + 1)}>
            تلاش دوباره
          </Button>
        </Alert>
      ) : !state.points.length ? (
        <Alert tone="info" title="هنوز دادهٔ تولیدی نیست">
          وقتی قرائت واقعی ثبت شود، سری {bucketLabel(bucket)} اینجا نمایش داده می‌شود.
        </Alert>
      ) : (
        <>
          <div
            className="overflow-x-auto rounded-md border border-border p-3"
            role="img"
            aria-label={`نمودار تولید ${bucketLabel(bucket)} نیروگاه ${plant.name}`}
          >
            <ul className="flex h-52 min-w-[28rem] items-stretch gap-2">
              {state.points.map((point) => {
                const value = Number(point.energyKwh) || 0;
                const height = maxEnergy > 0 ? Math.max(4, Math.round((value / maxEnergy) * 100)) : 4;
                return (
                  <li key={point.bucketStart} className="flex min-w-10 flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] tabular-nums text-foreground-muted" dir="ltr">
                      {formatDecimal(point.energyKwh)}
                    </span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-sm bg-[var(--emerald)]"
                        style={{ height: `${height}%` }}
                        title={`${point.label}: ${point.energyKwh} kWh`}
                      />
                    </div>
                    <span className="max-w-full truncate text-[10px] text-foreground-muted" title={point.label}>
                      {point.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[24rem] text-start text-sm">
              <thead className="border-b border-border bg-surface text-foreground-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">برچسب</th>
                  <th className="px-3 py-2 font-medium">شروع باکت</th>
                  <th className="px-3 py-2 font-medium">انرژی (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {state.points.map((point) => (
                  <tr key={point.bucketStart} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{point.label}</td>
                    <td className="px-3 py-2">
                      {formatJalaliDisplay(point.bucketStart)}
                    </td>
                    <td className="px-3 py-2" dir="ltr">
                      {formatDecimal(point.energyKwh)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-caption text-foreground-muted">
            {faNumber(state.points.length)} نقطه · باکت {bucketLabel(bucket)}
            {periodFrom || periodTo
              ? ` · فیلتر ${periodFrom || "…"} تا ${periodTo || "…"}`
              : ""}
          </p>
        </>
      )}
    </div>
  );
}
