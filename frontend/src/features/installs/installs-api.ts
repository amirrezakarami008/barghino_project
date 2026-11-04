import { ApiError, apiRequest } from "@/features/auth/lib/api";
import {
  InstallDataError,
  parseInstallMedia,
  parseInstallRequest,
  parsePage,
  record,
  type InstallMedia,
  type InstallRequest,
  type Page,
} from "./install-model";

export const installPageSize = 12;
export const installMediaMaxBytes = 25 * 1024 * 1024;
export const installImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type CreateInstallInput = {
  readonly address: string;
  readonly phone: string;
  readonly areaM2: string;
  readonly note: string;
};

export async function getInstallRequests(page: number, signal?: AbortSignal): Promise<Page<InstallRequest>> {
  return parsePage(
    await apiRequest<unknown>(`/installs/requests/?page=${page}&page_size=${installPageSize}`, {
      auth: true,
      signal,
    }),
    parseInstallRequest,
  );
}

export async function getInstallRequest(uuid: string, signal?: AbortSignal): Promise<InstallRequest> {
  return parseInstallRequest(
    await apiRequest<unknown>(`/installs/requests/${encodeURIComponent(uuid)}/`, { auth: true, signal }),
  );
}

export async function createInstallRequest(input: CreateInstallInput): Promise<InstallRequest> {
  return parseInstallRequest(
    await apiRequest<unknown>("/installs/requests/", {
      method: "POST",
      auth: true,
      body: {
        address: input.address,
        phone: input.phone,
        area_m2: input.areaM2,
        note: input.note,
      },
    }),
  );
}

export async function uploadInstallMedia(file: File): Promise<{ readonly uuid: string; readonly contentType: string }> {
  if (!installImageTypes.includes(file.type as (typeof installImageTypes)[number]) || file.size === 0 || file.size > installMediaMaxBytes) {
    throw new Error("تصویر باید JPEG، PNG یا WebP و حداکثر ۲۵ مگابایت باشد.");
  }
  const form = new FormData();
  form.append("file", file, file.name);
  form.append("purpose", "install_media");
  form.append("visibility", "private");
  const raw = record(await apiRequest<unknown>("/files/", { method: "POST", auth: true, body: form }));
  if (
    typeof raw.uuid !== "string" ||
    !raw.uuid ||
    raw.purpose !== "install_media" ||
    raw.visibility !== "private" ||
    typeof raw.content_type !== "string" ||
    !installImageTypes.includes(raw.content_type as (typeof installImageTypes)[number])
  ) {
    throw new InstallDataError();
  }
  return { uuid: raw.uuid, contentType: raw.content_type };
}

export async function attachInstallMedia(requestUuid: string, storedFileUuid: string): Promise<InstallMedia> {
  return parseInstallMedia(
    await apiRequest<unknown>(`/installs/requests/${encodeURIComponent(requestUuid)}/media/`, {
      method: "POST",
      auth: true,
      body: { stored_file_uuid: storedFileUuid },
    }),
  );
}

export async function removeInstallMedia(requestUuid: string, mediaUuid: string): Promise<void> {
  await apiRequest<unknown>(
    `/installs/requests/${encodeURIComponent(requestUuid)}/media/${encodeURIComponent(mediaUuid)}/`,
    { method: "DELETE", auth: true },
  );
}

export async function submitInstallRequest(uuid: string): Promise<InstallRequest> {
  return parseInstallRequest(
    await apiRequest<unknown>(`/installs/requests/${encodeURIComponent(uuid)}/submit/`, {
      method: "POST",
      auth: true,
    }),
  );
}

export function installError(error: unknown): string {
  if (error instanceof InstallDataError) return error.message;
  if (error instanceof Error && !(error instanceof ApiError) && error.message) return error.message;
  if (!(error instanceof ApiError)) return "انجام درخواست ممکن نشد. اتصال را بررسی کنید و دوباره تلاش کنید.";
  if (error.status === 401) return "نشست شما معتبر نیست؛ دوباره وارد شوید.";
  if (error.status === 403) return "به این اطلاعات دسترسی ندارید.";
  if (error.status === 404) return "این درخواست پیدا نشد یا دیگر در دسترس حساب شما نیست.";
  if (error.status === 0) return "ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی کنید.";
  if (error.status === 429) return "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.";
  if (error.status >= 500) return "سرویس درخواست نصب پاسخ نداد. کمی بعد دوباره تلاش کنید.";
  if (error.fields.address) return "نشانی محل نصب را کامل و درست وارد کنید.";
  if (error.fields.phone) return "شماره موبایل معتبر ایرانی وارد کنید.";
  if (error.fields.area_m2) return "مساحت نصب باید عددی مثبت بر حسب متر مربع باشد.";
  if (error.fields.note) return "یادداشت بیش از حد طولانی است.";
  if (error.fields.stored_file_uuid || error.fields.file) return "فایل تصویر پذیرفته نشد؛ فرمت و حجم را بررسی کنید.";
  if (error.fields.status || error.fields.stage) return "این عملیات برای وضعیت فعلی درخواست مجاز نیست.";
  if (error.fields.detail) {
    return Array.isArray(error.fields.detail) ? String(error.fields.detail[0]) : String(error.fields.detail);
  }
  return "درخواست پذیرفته نشد. اطلاعات را دوباره بررسی کنید.";
}

export function mutationMayHaveSucceeded(error: unknown): boolean {
  return (
    error instanceof InstallDataError ||
    error instanceof SyntaxError ||
    (error instanceof ApiError && (error.status === 0 || error.status >= 500))
  );
}
