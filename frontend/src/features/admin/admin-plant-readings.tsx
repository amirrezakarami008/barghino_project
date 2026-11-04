"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, StatusPill } from "@/components/ui";
import { formatDecimal } from "@/features/contracts";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { formatJalaliDisplay, JalaliDateField } from "@/shared/ui/jalali-date-field";
import type { AdminPlant, InventoryPage } from "./admin-plants-api";
import {
  createManualReading,
  getPlantReadings,
  plantTelemetryError,
  readingSourceLabel,
  uncertainTelemetryMutation,
  type PlantReading,
} from "./admin-plant-telemetry-api";

type ListState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: InventoryPage<PlantReading> };

function formatPeriod(iso: string): string {
  return formatJalaliDisplay(iso, { withTime: true });
}

function normalizeEnergy(raw: string): string | null {
  const normalized = raw
    .replace(/[۰-۹٠-٩]/g, (digit) =>
      String(
        "۰۱۲۳۴۵۶۷۸۹".includes(digit)
          ? "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
          : "٠١٢٣٤٥٦٧٨٩".indexOf(digit),
      ),
    )
    .replace("٫", ".")
    .trim();
  if (!/^\d{1,8}(\.\d{1,6})?$/.test(normalized) || !/[1-9]/.test(normalized)) return null;
  return normalized;
}

export function AdminPlantReadingsPanel({
  plant,
}: {
  readonly plant: AdminPlant;
}): ReactElement {
  const formId = useId();
  const createLock = useRef(false);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ readonly key: string; readonly state: ListState }>();
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [energy, setEnergy] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [notice, setNotice] = useState("");
  const key = `${plant.uuid}:${page}:${attempt}`;
  const state: ListState = result?.key === key ? result.state : { status: "loading" };

  useEffect(() => {
    const controller = new AbortController();
    void getPlantReadings(plant.uuid, page, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: plantTelemetryError(failure) } });
        }
      });
    return () => controller.abort();
  }, [key, page, plant.uuid, attempt]);

  function reload(): void {
    setAttempt((value) => value + 1);
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (createLock.current) return;
    const energyKwh = normalizeEnergy(energy);
    if (!periodStart.trim() || !periodEnd.trim() || !energyKwh) {
      setCreateError("شروع، پایان و انرژی مثبت معتبر را وارد کنید.");
      return;
    }
    if (new Date(periodEnd).getTime() <= new Date(periodStart).getTime()) {
      setCreateError("پایان بازه باید بعد از شروع باشد.");
      return;
    }
    createLock.current = true;
    setCreating(true);
    setCreateError("");
    setNotice("");
    try {
      await createManualReading(plant.uuid, {
        period_start: periodStart,
        period_end: periodEnd,
        energy_kwh: energyKwh,
      });
      setPeriodStart("");
      setPeriodEnd("");
      setEnergy("");
      setNotice("قرائت دستی ثبت شد.");
      setPage(1);
      reload();
    } catch (failure) {
      setCreateError(plantTelemetryError(failure));
      if (uncertainTelemetryMutation(failure)) reload();
    } finally {
      createLock.current = false;
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        id={formId}
        className="space-y-3 rounded-md border border-border p-3"
        onSubmit={(event) => void submit(event)}
      >
        <h3 className="text-sm font-semibold">قرائت دستی</h3>
        <p className="text-caption text-foreground-muted">
          بازه حداکثر حدود یک ماه؛ هم‌پوشانی با قرائت‌های قبلی مجاز نیست. بدون message_id.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <JalaliDateField
            label="شروع بازه"
            mode="datetime"
            value={periodStart}
            onChange={setPeriodStart}
            required
            disabled={creating}
          />
          <JalaliDateField
            label="پایان بازه"
            mode="datetime"
            value={periodEnd}
            onChange={setPeriodEnd}
            required
            disabled={creating}
          />
          <Input
            label="انرژی (kWh)"
            inputMode="decimal"
            dir="ltr"
            value={energy}
            onChange={(event) => setEnergy(event.target.value)}
            required
            disabled={creating}
            helperText="عدد مثبت؛ حداکثر شش رقم اعشار"
          />
        </div>
        {createError ? <Alert tone="danger" title={createError} /> : null}
        {notice ? <Alert tone="success" title={notice} /> : null}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={creating}>
            <Icon name="plus" className="size-4" />
            {creating ? "در حال ثبت…" : "ثبت قرائت"}
          </Button>
        </div>
      </form>

      {state.status === "loading" ? (
        <p className="text-sm text-foreground-muted">در حال بارگذاری قرائت‌ها…</p>
      ) : state.status === "error" ? (
        <Alert tone="danger" title={state.message}>
          <Button variant="secondary" className="mt-2" onClick={reload}>
            تلاش دوباره
          </Button>
        </Alert>
      ) : !state.data.results.length ? (
        <Alert tone="info" title="قرائتی ثبت نشده">
          هنوز قرائت بورد یا دستی برای این نیروگاه نیست.
        </Alert>
      ) : (
        <ul className="space-y-3" aria-label="فهرست قرائت‌ها">
          {state.data.results.map((reading) => (
            <li key={reading.uuid} className="rounded-md border border-border px-3 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold" dir="ltr">
                      {formatDecimal(reading.energyKwh)} kWh
                    </span>
                    <StatusPill
                      status={reading.source === "board" ? "active" : "draft"}
                      label={readingSourceLabel(reading.source)}
                    />
                  </div>
                  <p className="text-sm text-foreground-muted">
                    {formatPeriod(reading.periodStart)} تا {formatPeriod(reading.periodEnd)}
                  </p>
                  {reading.deviceId ? (
                    <p className="text-caption text-foreground-muted" dir="ltr">
                      device: {reading.deviceId}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {state.status === "ready" && (state.data.next || state.data.previous) ? (
        <nav className="flex items-center justify-between gap-2 text-sm" aria-label="صفحه‌بندی قرائت‌ها">
          <Button
            variant="ghost"
            disabled={!state.data.previous}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            قبلی
          </Button>
          <span>
            صفحهٔ {faNumber(page)} · {faNumber(state.data.count)} قرائت
          </span>
          <Button variant="ghost" disabled={!state.data.next} onClick={() => setPage((value) => value + 1)}>
            بعدی
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
