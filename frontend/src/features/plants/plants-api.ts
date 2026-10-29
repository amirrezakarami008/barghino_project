import { ApiError, apiRequest } from "@/features/auth/lib/api";

export type Branch = { readonly uuid: string; readonly name: string; readonly meter_number: string; readonly address: string; readonly status: string; readonly review_note: string; readonly owner_phone: string };
export type Plant = { readonly uuid: string; readonly name: string; readonly branch_uuid: string; readonly address: string; readonly capacity_kwp: string; readonly status: string; readonly review_note: string; readonly owner_phone: string };
export type Page<T> = { readonly count: number; readonly next: boolean; readonly previous: boolean; readonly results: readonly T[] };
export type BranchInput = Pick<Branch, "name" | "meter_number" | "address">;
export type PlantInput = Pick<Plant, "name" | "branch_uuid" | "address" | "capacity_kwp">;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("پاسخ سرویس قابل خواندن نیست.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string { return typeof value === "string" ? value : ""; }
function base(value: unknown): Branch {
  const raw = record(value);
  if (!text(raw.uuid) || !text(raw.name) || !text(raw.status)) throw new Error("اطلاعات دریافتی ناقص است.");
  return { uuid: text(raw.uuid), name: text(raw.name), status: text(raw.status), address: text(raw.address), meter_number: text(raw.meter_number), review_note: text(raw.review_note), owner_phone: text(raw.owner_phone) };
}
export function parseBranch(value: unknown): Branch { return base(value); }
export function parsePlant(value: unknown): Plant {
  const raw = record(value), item = base(value);
  if (!text(raw.branch_uuid) || !["string", "number"].includes(typeof raw.capacity_kwp)) throw new Error("اطلاعات نیروگاه ناقص است.");
  return { ...item, branch_uuid: text(raw.branch_uuid), capacity_kwp: String(raw.capacity_kwp) };
}
export function parsePage<T>(value: unknown, parse: (item: unknown) => T): Page<T> {
  const raw = record(value);
  if (!Array.isArray(raw.results) || typeof raw.count !== "number" || !Number.isSafeInteger(raw.count) || raw.count < 0) throw new Error("فهرست دریافتی ناقص است.");
  return { count: raw.count, next: typeof raw.next === "string", previous: typeof raw.previous === "string", results: raw.results.map(parse) };
}
export async function getBranches(page: number, signal: AbortSignal): Promise<Page<Branch>> {
  return parsePage(await apiRequest<unknown>(`/branches/?page=${page}&page_size=20`, { auth: true, signal }), parseBranch);
}
export async function getPlants(page: number, signal: AbortSignal): Promise<Page<Plant>> {
  return parsePage(await apiRequest<unknown>(`/plants/?page=${page}&page_size=20`, { auth: true, signal }), parsePlant);
}
export async function saveBranch(input: BranchInput, uuid?: string): Promise<Branch> {
  return parseBranch(await apiRequest<unknown>(uuid ? `/branches/${encodeURIComponent(uuid)}/` : "/branches/", { auth: true, method: uuid ? "PATCH" : "POST", body: input }));
}
export async function savePlant(input: PlantInput, uuid?: string): Promise<Plant> {
  return parsePlant(await apiRequest<unknown>(uuid ? `/plants/${encodeURIComponent(uuid)}/` : "/plants/", { auth: true, method: uuid ? "PATCH" : "POST", body: input }));
}
export function plantError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "نشست شما معتبر نیست؛ دوباره وارد شوید.";
    if (error.status === 403) return "برای این کار دسترسی ندارید.";
    if (error.status === 404) return "این مورد دیگر در دسترس نیست. فهرست را تازه‌سازی کنید.";
    if (error.status === 0 || error.status >= 500) return "پاسخ سرویس دریافت نشد؛ پیش از تکرار ثبت، فهرست را بررسی کنید.";
    if (error.fields.meter_number) return "شماره کنتور معتبر وارد کنید؛ این شماره ممکن است قبلاً ثبت شده باشد.";
    if (error.fields.capacity_kwp) return "ظرفیت باید عدد مثبت با حداکثر سه رقم اعشار باشد.";
    if (error.fields.branch_uuid || error.fields.branch) return "انشعاب انتخاب‌شده قابل استفاده نیست؛ فهرست را تازه‌سازی کنید.";
    return "درخواست پذیرفته نشد. اطلاعات و وضعیت مورد انتخاب‌شده را بررسی کنید.";
  }
  return "دریافت یا ذخیرهٔ اطلاعات انجام نشد. اتصال را بررسی و دوباره تلاش کنید.";
}
export function latinDigits(value: string): string { return value.replace(/[۰-۹٠-٩]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit) >= 0 ? "۰۱۲۳۴۵۶۷۸۹".indexOf(digit) : "٠١٢٣٤٥٦٧٨٩".indexOf(digit))); }

export async function getBranch(uuid: string, signal: AbortSignal): Promise<Branch> {
  return parseBranch(await apiRequest<unknown>(`/branches/${encodeURIComponent(uuid)}/`, { auth: true, signal }));
}
export async function getPlant(uuid: string, signal: AbortSignal): Promise<Plant> {
  return parsePlant(await apiRequest<unknown>(`/plants/${encodeURIComponent(uuid)}/`, { auth: true, signal }));
}
