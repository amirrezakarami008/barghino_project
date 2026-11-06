"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { Button, Skeleton } from "@/components/ui";
import {
  getPlantTodayEarnings,
  getPlantTodayProduction,
  plantError,
  type TodayEarnings,
  type TodayProduction,
} from "./plants-api";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";

type MetricState<T> =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: T };

function jalaliDate(value: string, withTime = false): string {
  const date = new Date(withTime ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "زمان ثبت نشده";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    ...(withTime
      ? { dateStyle: "medium" as const, timeStyle: "short" as const }
      : { dateStyle: "medium" as const }),
  }).format(date);
}

function useTodayProduction(plantUuid: string, attempt: number): MetricState<TodayProduction> {
  const [result, setResult] = useState<{ readonly key: string; readonly state: MetricState<TodayProduction> }>();
  const key = `${plantUuid}:${attempt}`;
  const state = result?.key === key ? result.state : { status: "loading" as const };

  useEffect(() => {
    const controller = new AbortController();
    void getPlantTodayProduction(plantUuid, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: plantError(error) } });
        }
      });
    return () => controller.abort();
  }, [key, plantUuid]);

  return state;
}

function useTodayEarnings(plantUuid: string, attempt: number): MetricState<TodayEarnings> {
  const [result, setResult] = useState<{ readonly key: string; readonly state: MetricState<TodayEarnings> }>();
  const key = `${plantUuid}:${attempt}`;
  const state = result?.key === key ? result.state : { status: "loading" as const };

  useEffect(() => {
    const controller = new AbortController();
    void getPlantTodayEarnings(plantUuid, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: plantError(error) } });
        }
      });
    return () => controller.abort();
  }, [key, plantUuid]);

  return state;
}

function MetricShell({
  label,
  icon,
  tone,
  children,
}: {
  readonly label: string;
  readonly icon: "bolt" | "coins";
  readonly tone: "energy" | "sun";
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className={`plant-metric plant-metric--${tone}`}>
      <div className="plant-metric__head">
        <span className="plant-metric__icon" aria-hidden>
          <Icon name={icon} className="size-4" />
        </span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function MetricRetry({
  message,
  onRetry,
  label,
}: {
  readonly message: string;
  readonly onRetry: () => void;
  readonly label: string;
}): ReactElement {
  return (
    <div className="plant-metric__retry">
      <p className="plant-metric__hint plant-metric__hint--danger" title={message} role="status">
        دریافت ناموفق بود
      </p>
      <Button variant="ghost" size="sm" aria-label={label} onClick={onRetry}>
        تلاش دوباره
      </Button>
    </div>
  );
}

function ProductionMetric({
  plantUuid,
}: {
  readonly plantUuid: string;
}): ReactElement {
  const [attempt, setAttempt] = useState(0);
  const state = useTodayProduction(plantUuid, attempt);

  return (
    <MetricShell label="تولید امروز" icon="bolt" tone="energy">
      {state.status === "loading" ? (
        <>
          <Skeleton className="mt-2 h-7 w-28" />
          <Skeleton className="mt-2 h-3 w-36" />
        </>
      ) : state.status === "error" ? (
        <MetricRetry
          message={state.message}
          label="تلاش دوباره برای دریافت تولید امروز"
          onRetry={() => setAttempt((value) => value + 1)}
        />
      ) : (
        <>
          <p className="plant-metric__value" dir="ltr">
            <bdi>{faNumber(state.data.energyKwh, { maximumFractionDigits: 2 })}</bdi>
            <em>kWh</em>
          </p>
          <p className="plant-metric__hint">
            {state.data.energyKwh === 0
              ? "هنوز تولیدی ثبت نشده"
              : state.data.measuredAt
                ? `آخرین اندازه‌گیری ${jalaliDate(state.data.measuredAt, true)}`
                : `تاریخ ${jalaliDate(state.data.productionDate)}`}
          </p>
        </>
      )}
    </MetricShell>
  );
}

function EarningsMetric({
  plantUuid,
}: {
  readonly plantUuid: string;
}): ReactElement {
  const [attempt, setAttempt] = useState(0);
  const state = useTodayEarnings(plantUuid, attempt);

  return (
    <MetricShell label="درآمد امروز" icon="coins" tone="sun">
      {state.status === "loading" ? (
        <>
          <Skeleton className="mt-2 h-7 w-32" />
          <Skeleton className="mt-2 h-3 w-40" />
        </>
      ) : state.status === "error" ? (
        <MetricRetry
          message={state.message}
          label="تلاش دوباره برای دریافت درآمد امروز"
          onRetry={() => setAttempt((value) => value + 1)}
        />
      ) : state.data.estimatedAmountToman === null ? (
        <>
          <p className="plant-metric__value plant-metric__value--muted">—</p>
          <p className="plant-metric__hint">
            {state.data.contractUuid
              ? "نرخ قرارداد برای محاسبه موجود نیست"
              : "قرارداد فعالی برای قیمت‌گذاری نیست"}
          </p>
        </>
      ) : (
        <>
          <p className="plant-metric__value" dir="ltr">
            <bdi>
              {faNumber(state.data.estimatedAmountToman, {
                maximumFractionDigits: 3,
              })}
            </bdi>
            <em>تومان</em>
          </p>
          <p className="plant-metric__hint">
            {state.data.rateTomanPerKwh === null
              ? jalaliDate(state.data.productionDate)
              : `نرخ ${faNumber(state.data.rateTomanPerKwh, { maximumFractionDigits: 3 })} تومان / kWh`}
          </p>
        </>
      )}
    </MetricShell>
  );
}

export function PlantTodayMetrics({
  plantUuid,
}: {
  readonly plantUuid: string;
}): ReactElement {
  return (
    <section className="plant-metrics" aria-label="تولید و درآمد امروز">
      <ProductionMetric plantUuid={plantUuid} />
      <EarningsMetric plantUuid={plantUuid} />
    </section>
  );
}
