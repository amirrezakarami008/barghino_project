import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { parsePage } from "@/features/plants";
import type { InventoryPage } from "./admin-plants-api";

export type PlantDevice = {
  readonly uuid: string;
  readonly deviceId: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly lastSeenAt: string;
  readonly createdAt: string;
};

export type PlantDeviceSecret = PlantDevice & {
  readonly apiKey: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error("اطلاعات بورد قابل خواندن نیست.");
  return value;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parsePlantDevice(value: unknown): PlantDevice {
  const raw = record(value);
  const uuid = text(raw.uuid);
  const deviceId = text(raw.device_id);
  if (!uuid || !deviceId) throw new Error("شناسهٔ بورد در پاسخ ناقص است.");
  return {
    uuid,
    deviceId,
    name: text(raw.name),
    isActive: bool(raw.is_active, true),
    lastSeenAt: text(raw.last_seen_at),
    createdAt: text(raw.created_at),
  };
}

function parsePlantDeviceSecret(value: unknown): PlantDeviceSecret {
  const device = parsePlantDevice(value);
  const apiKey = text(record(value).api_key);
  if (!apiKey) throw new Error("کلید API در پاسخ ثبت بورد نبود.");
  return { ...device, apiKey };
}

function parseDeviceList(value: unknown): InventoryPage<PlantDevice> {
  if (Array.isArray(value)) {
    return {
      count: value.length,
      next: false,
      previous: false,
      results: value.map(parsePlantDevice),
    };
  }
  return parsePage(value, parsePlantDevice);
}

export async function getPlantDevices(
  plantUuid: string,
  page: number,
  signal: AbortSignal,
): Promise<InventoryPage<PlantDevice>> {
  const params = new URLSearchParams({ page: String(page), page_size: "20" });
  return parseDeviceList(
    await apiRequest<unknown>(`/plants/${encodeURIComponent(plantUuid)}/devices/?${params}`, {
      auth: true,
      signal,
    }),
  );
}

export async function createPlantDevice(
  plantUuid: string,
  input: { readonly device_id: string; readonly name?: string },
): Promise<PlantDeviceSecret> {
  return parsePlantDeviceSecret(
    await apiRequest<unknown>(`/plants/${encodeURIComponent(plantUuid)}/devices/`, {
      auth: true,
      method: "POST",
      body: input,
    }),
  );
}

export async function rotatePlantDeviceKey(deviceUuid: string): Promise<PlantDeviceSecret> {
  return parsePlantDeviceSecret(
    await apiRequest<unknown>(`/devices/${encodeURIComponent(deviceUuid)}/rotate-key/`, {
      auth: true,
      method: "POST",
    }),
  );
}

export async function setPlantDeviceActive(
  deviceUuid: string,
  isActive: boolean,
): Promise<PlantDevice> {
  return parsePlantDevice(
    await apiRequest<unknown>(`/devices/${encodeURIComponent(deviceUuid)}/active/`, {
      auth: true,
      method: "POST",
      body: { is_active: isActive },
    }),
  );
}

export function plantDeviceError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "برای مدیریت بورد این نیروگاه دسترسی ندارید.";
    if (error.status === 404) return "این نیروگاه یا بورد دیگر در دسترس نیست؛ فهرست را تازه‌سازی کنید.";
    if (error.status === 401) return "نشست شما منقضی شده است؛ دوباره وارد شوید.";
    if (error.status === 0 || error.status >= 500) {
      return "نتیجهٔ درخواست مشخص نیست؛ پیش از ارسال دوباره، فهرست بوردها را تازه‌سازی کنید.";
    }
    if (error.fields.device_id) {
      return "شناسهٔ بورد معتبر و یکتا وارد کنید (به صورت حروف بزرگ ذخیره می‌شود).";
    }
    if (error.fields.name) return "نام بورد را بررسی کنید.";
    if (error.fields.is_active) return "وضعیت فعال/غیرفعال پذیرفته نشد.";
    if (error.message.toLowerCase().includes("active") || error.fields.detail?.includes?.("active")) {
      return "فقط برای نیروگاه تأییدشده می‌توان بورد ثبت کرد.";
    }
    return "درخواست بورد پذیرفته نشد؛ شناسه و وضعیت نیروگاه را بررسی کنید.";
  }
  return "دریافت یا ذخیرهٔ بورد انجام نشد؛ اتصال و پاسخ سرویس را بررسی کنید.";
}

export function uncertainDeviceMutation(error: unknown): boolean {
  return !(error instanceof ApiError) || error.status === 0 || error.status >= 500;
}
