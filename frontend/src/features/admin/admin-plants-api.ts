import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { parseBranch, parsePlant, parsePage, type Plant, type Branch } from "@/features/plants";

export type AdminPlant = Plant & { readonly ownerUuid: string; readonly commissionedAt: string; readonly createdAt: string };
export type AdminBranch = Branch & { readonly ownerUuid: string };
export type InventoryPage<T> = { readonly count: number; readonly next: boolean; readonly previous: boolean; readonly results: readonly T[] };
export type PlantWrite = { readonly branch_uuid: string; readonly name: string; readonly address: string; readonly capacity_kwp: string; readonly commissioned_at: string | null };
function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function record(value: unknown): Record<string, unknown> { if (!isRecord(value)) throw new Error("اطلاعات دریافتی قابل خواندن نیست."); return value; }
export function parseAdminPlant(value: unknown): AdminPlant {
  const raw = record(value), plant = parsePlant(value);
  if (typeof raw.owner_uuid !== "string" || !raw.owner_uuid) throw new Error("مالک نیروگاه در پاسخ مشخص نیست.");
  return { ...plant, ownerUuid: raw.owner_uuid, commissionedAt: typeof raw.commissioned_at === "string" ? raw.commissioned_at : "", createdAt: typeof raw.created_at === "string" ? raw.created_at : "" };
}
function parseAdminBranch(value: unknown): AdminBranch {
  const raw = record(value), branch = parseBranch(value);
  if (typeof raw.owner_uuid !== "string" || !raw.owner_uuid) throw new Error("مالک انشعاب در پاسخ مشخص نیست.");
  return { ...branch, ownerUuid: raw.owner_uuid };
}
export async function getAdminPlants(page: number, status: string, search: string, signal: AbortSignal): Promise<InventoryPage<AdminPlant>> {
  const params = new URLSearchParams({ page: String(page), page_size: "12", status });
  if (search.trim()) params.set("search", search.trim());
  return parsePage(await apiRequest<unknown>(`/staff/plants/?${params}`, { auth: true, signal }), parseAdminPlant);
}
export async function getAdminBranches(page: number, search: string, owner: string | undefined, signal: AbortSignal): Promise<InventoryPage<AdminBranch>> {
  const params = new URLSearchParams({ page: String(page), page_size: "12", status: "all" });
  if (search.trim()) params.set("search", search.trim());
  if (owner) params.set("owner_uuid", owner);
  return parsePage(await apiRequest<unknown>(`/staff/branches/?${params}`, { auth: true, signal }), parseAdminBranch);
}
export async function saveAdminPlant(data: PlantWrite, uuid?: string): Promise<AdminPlant> {
  return parseAdminPlant(await apiRequest<unknown>(uuid ? `/staff/plants/${encodeURIComponent(uuid)}/` : "/staff/plants/", { auth: true, method: uuid ? "PATCH" : "POST", body: data }));
}
export async function deleteAdminPlant(uuid: string): Promise<void> { await apiRequest(`/staff/plants/${encodeURIComponent(uuid)}/`, { auth: true, method: "DELETE" }); }
export function adminPlantError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "دسترسی مدیریت نیروگاه‌ها برای حساب شما فعال نیست.";
    if (error.status === 404) return "این نیروگاه یا انشعاب دیگر در دسترس نیست؛ فهرست را تازه‌سازی کنید.";
    if (error.status === 401) return "نشست شما منقضی شده است؛ دوباره وارد شوید.";
    if (error.status === 0 || error.status >= 500) return "نتیجهٔ درخواست مشخص نیست؛ پیش از ارسال دوباره، فهرست را تازه‌سازی و بررسی کنید.";
    if (error.fields.branch || error.fields.branch_uuid) return "انشعاب انتخاب‌شده قابل استفاده نیست یا به مالک این نیروگاه تعلق ندارد.";
    if (error.fields.capacity_kwp) return "ظرفیت مثبت با حداکثر سه رقم اعشار وارد کنید.";
    if (error.fields.name) return "نام نیروگاه را بررسی کنید.";
    if (error.fields.address) return "نشانی نیروگاه را بررسی کنید.";
    if (error.fields.commissioned_at) return "تاریخ بهره‌برداری را بررسی کنید.";
    return "درخواست پذیرفته نشد؛ اطلاعات و وضعیت نیروگاه را بررسی کنید.";
  }
  return "دریافت یا ذخیرهٔ اطلاعات نیروگاه انجام نشد؛ اتصال و پاسخ سرویس را بررسی کنید.";
}
export function uncertainPlantMutation(error: unknown): boolean { return !(error instanceof ApiError) || error.status === 0 || error.status >= 500; }
export function plantStatusLabel(status: string): string { return status === "active" ? "تأییدشده" : status === "pending" ? "در انتظار بررسی" : status === "inactive" ? "ردشده / غیرفعال" : status === "maintenance" ? "در حال تعمیر" : "وضعیت نامشخص"; }
