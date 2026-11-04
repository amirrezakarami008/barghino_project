import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { parsePage } from "@/features/plants";
import type { InventoryPage } from "./admin-plants-api";

export type ReadingSource = "board" | "manual" | string;

export type PlantReading = {
  readonly uuid: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly energyKwh: string;
  readonly source: ReadingSource;
  readonly deviceId: string;
  readonly createdAt: string;
};

export type ProductionBucket = "day" | "week" | "month";

export type ProductionPoint = {
  readonly bucketStart: string;
  readonly label: string;
  readonly energyKwh: string;
};

export type ManualReadingInput = {
  readonly period_start: string;
  readonly period_end: string;
  readonly energy_kwh: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error("اطلاعات قرائت قابل خواندن نیست.");
  return value;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

export function parsePlantReading(value: unknown): PlantReading {
  const raw = record(value);
  const uuid = text(raw.uuid);
  const periodStart = text(raw.period_start);
  const periodEnd = text(raw.period_end);
  const energyKwh = text(raw.energy_kwh);
  if (!uuid || !periodStart || !periodEnd || !energyKwh) {
    throw new Error("قرائت دریافتی ناقص است.");
  }
  return {
    uuid,
    periodStart,
    periodEnd,
    energyKwh,
    source: text(raw.source) || text(raw.kind) || "manual",
    deviceId: text(raw.device_id),
    createdAt: text(raw.created_at),
  };
}

function parseReadingList(value: unknown): InventoryPage<PlantReading> {
  if (Array.isArray(value)) {
    return {
      count: value.length,
      next: false,
      previous: false,
      results: value.map(parsePlantReading),
    };
  }
  return parsePage(value, parsePlantReading);
}

export function parseProductionPoint(value: unknown): ProductionPoint {
  const raw = record(value);
  const bucketStart = text(raw.bucket_start);
  const energyKwh = text(raw.energy_kwh);
  if (!bucketStart || !energyKwh) throw new Error("نقطهٔ تولید ناقص است.");
  return {
    bucketStart,
    label: text(raw.label) || bucketStart,
    energyKwh,
  };
}

function parseProductionSeries(value: unknown): readonly ProductionPoint[] {
  if (Array.isArray(value)) return value.map(parseProductionPoint);
  const raw = record(value);
  const series = raw.results ?? raw.points ?? raw.series;
  if (!Array.isArray(series)) throw new Error("سری تولید قابل خواندن نیست.");
  return series.map(parseProductionPoint);
}

export async function getPlantReadings(
  plantUuid: string,
  page: number,
  signal: AbortSignal,
): Promise<InventoryPage<PlantReading>> {
  const params = new URLSearchParams({ page: String(page), page_size: "20" });
  return parseReadingList(
    await apiRequest<unknown>(`/plants/${encodeURIComponent(plantUuid)}/readings/?${params}`, {
      auth: true,
      signal,
    }),
  );
}

export async function createManualReading(
  plantUuid: string,
  input: ManualReadingInput,
): Promise<PlantReading> {
  return parsePlantReading(
    await apiRequest<unknown>(`/plants/${encodeURIComponent(plantUuid)}/readings/`, {
      auth: true,
      method: "POST",
      body: input,
    }),
  );
}

export async function getPlantProduction(
  plantUuid: string,
  query: {
    readonly bucket: ProductionBucket;
    readonly periodFrom?: string;
    readonly periodTo?: string;
  },
  signal: AbortSignal,
): Promise<readonly ProductionPoint[]> {
  const params = new URLSearchParams({ bucket: query.bucket });
  if (query.periodFrom) params.set("period_from", query.periodFrom);
  if (query.periodTo) params.set("period_to", query.periodTo);
  return parseProductionSeries(
    await apiRequest<unknown>(`/plants/${encodeURIComponent(plantUuid)}/production/?${params}`, {
      auth: true,
      signal,
    }),
  );
}

export function plantTelemetryError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "برای قرائت یا تولید این نیروگاه دسترسی ندارید.";
    if (error.status === 404) return "این نیروگاه دیگر در دسترس نیست؛ فهرست را تازه‌سازی کنید.";
    if (error.status === 401) return "نشست شما منقضی شده است؛ دوباره وارد شوید.";
    if (error.status === 0 || error.status >= 500) {
      return "نتیجهٔ درخواست مشخص نیست؛ پیش از ارسال دوباره، داده‌ها را تازه‌سازی کنید.";
    }
    if (error.fields.period_start || error.fields.period_end) {
      return "بازهٔ زمانی را بررسی کنید؛ حداکثر حدود یک ماه و بدون هم‌پوشانی با قرائت‌های قبلی.";
    }
    if (error.fields.energy_kwh) return "مقدار انرژی باید عدد مثبت معتبر بر حسب کیلووات‌ساعت باشد.";
    if (error.fields.bucket) return "باکت نمودار را از بین روز، هفته و ماه انتخاب کنید.";
    if (
      error.message.toLowerCase().includes("overlap") ||
      error.fields.detail?.toLowerCase?.().includes("overlap")
    ) {
      return "این بازه با قرائت ثبت‌شدهٔ دیگری هم‌پوشانی دارد.";
    }
    return "درخواست قرائت یا تولید پذیرفته نشد؛ مقادیر را بررسی کنید.";
  }
  return "دریافت یا ذخیرهٔ قرائت/تولید انجام نشد؛ اتصال و پاسخ سرویس را بررسی کنید.";
}

export function uncertainTelemetryMutation(error: unknown): boolean {
  return !(error instanceof ApiError) || error.status === 0 || error.status >= 500;
}

export function readingSourceLabel(source: ReadingSource): string {
  if (source === "board") return "بورد";
  if (source === "manual") return "دستی";
  return source || "نامشخص";
}
