import { ApiError, apiRequest } from "@/features/auth/lib/api";
import {
  defaultPlantName,
  isSchemeType,
  isSystemType,
  type SchemeType,
  type SystemType,
} from "./plant-options";

export type { SchemeType, SystemType } from "./plant-options";

export type Branch = {
  readonly uuid: string;
  readonly name: string;
  readonly bill_id: string;
  readonly address: string;
  readonly status: string;
  readonly review_note: string;
  readonly owner_phone: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly reviewed_at: string;
  readonly review_decision: string;
  readonly reviewed_by_uuid: string;
};
export type Plant = {
  readonly uuid: string;
  /** Display label; derived client-side when the API omits name. */
  readonly name: string;
  readonly branch_uuid: string;
  readonly address: string;
  readonly capacity_kwp: string;
  readonly scheme_type: SchemeType;
  readonly system_type: SystemType;
  readonly status: string;
  readonly review_note: string;
  readonly owner_phone: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly reviewed_at: string;
  readonly review_decision: string;
  readonly reviewed_by_uuid: string;
};
export type TodayProduction = {
  readonly productionDate: string;
  readonly energyKwh: number;
  readonly measuredAt: string | null;
};
export type TodayEarnings = {
  readonly productionDate: string;
  readonly energyKwh: number;
  readonly rateTomanPerKwh: number | null;
  readonly estimatedAmountToman: number | null;
  readonly contractUuid: string | null;
  readonly measuredAt: string | null;
};
export type Page<T> = { readonly count: number; readonly next: boolean; readonly previous: boolean; readonly results: readonly T[] };
export type BranchInput = Pick<Branch, "name" | "bill_id" | "address">;
export type PlantInput = Pick<Plant, "branch_uuid" | "capacity_kwp" | "scheme_type" | "system_type">;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("پاسخ سرویس قابل خواندن نیست.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string { return typeof value === "string" ? value : ""; }
function base(value: unknown): Branch {
  const raw = record(value);
  if (!text(raw.uuid) || !text(raw.name) || !text(raw.status)) throw new Error("اطلاعات دریافتی ناقص است.");
  return {
    uuid: text(raw.uuid),
    name: text(raw.name),
    status: text(raw.status),
    address: text(raw.address),
    bill_id: text(raw.bill_id),
    review_note: text(raw.review_note),
    owner_phone: text(raw.owner_phone),
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    reviewed_at: text(raw.reviewed_at),
    review_decision: text(raw.review_decision),
    reviewed_by_uuid: text(raw.reviewed_by_uuid),
  };
}
export function parseBranch(value: unknown): Branch { return base(value); }
export function parsePlant(value: unknown): Plant {
  const raw = record(value);
  if (!text(raw.uuid) || !text(raw.status)) throw new Error("اطلاعات دریافتی ناقص است.");
  if (!text(raw.branch_uuid) || !["string", "number"].includes(typeof raw.capacity_kwp)) {
    throw new Error("اطلاعات نیروگاه ناقص است.");
  }
  if (!isSchemeType(raw.scheme_type) || !isSystemType(raw.system_type)) {
    throw new Error("نوع طرح یا اتصال شبکه نیروگاه نامعتبر است.");
  }
  const capacity_kwp = String(raw.capacity_kwp);
  const scheme_type = raw.scheme_type;
  const system_type = raw.system_type;
  return {
    uuid: text(raw.uuid),
    name:
      text(raw.name) ||
      defaultPlantName({ schemeType: scheme_type, systemType: system_type, capacity: capacity_kwp }),
    status: text(raw.status),
    address: text(raw.address),
    review_note: text(raw.review_note),
    owner_phone: text(raw.owner_phone),
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    reviewed_at: text(raw.reviewed_at),
    review_decision: text(raw.review_decision),
    reviewed_by_uuid: text(raw.reviewed_by_uuid),
    branch_uuid: text(raw.branch_uuid),
    capacity_kwp,
    scheme_type,
    system_type,
  };
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
    if (error.fields.bill_id) return "شناسه قبض معتبر وارد کنید؛ این شناسه ممکن است قبلاً ثبت شده باشد.";
    if (error.fields.capacity_kwp) return "ظرفیت باید عدد مثبت با حداکثر سه رقم اعشار باشد.";
    if (error.fields.scheme_type) return "کاربری طرح را از بین گزینه‌های مسکونی و غیرمسکونی انتخاب کنید.";
    if (error.fields.system_type) return "نوع اتصال به شبکه را مشخص کنید.";
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

function isoDate(value: unknown): string {
  const productionDate = text(value);
  const parsedDate = new Date(`${productionDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(productionDate) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== productionDate
  ) {
    throw new Error("تاریخ تولید معتبر نیست.");
  }
  return productionDate;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function measuredAtField(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error("زمان اندازه‌گیری معتبر نیست.");
  }
  return value;
}

export function parseTodayProduction(value: unknown): TodayProduction {
  const raw = record(value);
  const energyKwh = finiteNumber(raw.energy_kwh);
  if (energyKwh === null) throw new Error("اطلاعات تولید امروز قابل خواندن نیست.");
  return {
    productionDate: isoDate(raw.production_date),
    energyKwh,
    measuredAt: measuredAtField(raw.measured_at),
  };
}

export function parseTodayEarnings(value: unknown): TodayEarnings {
  const raw = record(value);
  const energyKwh = finiteNumber(raw.energy_kwh);
  if (energyKwh === null) throw new Error("اطلاعات درآمد امروز قابل خواندن نیست.");

  const rate = raw.rate_toman_per_kwh;
  const amount = raw.estimated_amount_toman;
  const rateTomanPerKwh = rate === null || rate === undefined ? null : finiteNumber(rate);
  const estimatedAmountToman = amount === null || amount === undefined ? null : finiteNumber(amount);
  if (rate !== null && rate !== undefined && rateTomanPerKwh === null) {
    throw new Error("نرخ قرارداد قابل خواندن نیست.");
  }
  if (amount !== null && amount !== undefined && estimatedAmountToman === null) {
    throw new Error("مبلغ برآوردی قابل خواندن نیست.");
  }

  const contractRaw = raw.contract_uuid;
  const contractUuid =
    contractRaw === null || contractRaw === undefined || contractRaw === ""
      ? null
      : text(contractRaw);
  if (contractRaw !== null && contractRaw !== undefined && contractRaw !== "" && !contractUuid) {
    throw new Error("شناسه قرارداد معتبر نیست.");
  }

  return {
    productionDate: isoDate(raw.production_date),
    energyKwh,
    rateTomanPerKwh,
    estimatedAmountToman,
    contractUuid,
    measuredAt: measuredAtField(raw.measured_at),
  };
}

export async function getPlantTodayProduction(
  uuid: string,
  signal: AbortSignal,
): Promise<TodayProduction> {
  return parseTodayProduction(
    await apiRequest<unknown>(`/plants/${encodeURIComponent(uuid)}/production/today/`, {
      auth: true,
      signal,
    }),
  );
}

export async function getPlantTodayEarnings(
  uuid: string,
  signal: AbortSignal,
): Promise<TodayEarnings> {
  return parseTodayEarnings(
    await apiRequest<unknown>(`/plants/${encodeURIComponent(uuid)}/earnings/today/`, {
      auth: true,
      signal,
    }),
  );
}
