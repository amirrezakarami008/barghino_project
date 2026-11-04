import { apiRequest } from "@/features/auth/lib/api";
import { formatFa } from "@/shared/lib/fa";

export const EQUIPMENT_CATEGORIES = [
  { value: "panel", label: "پنل" },
  { value: "inverter", label: "اینورتر" },
  { value: "mounting", label: "سازه / نصب" },
  { value: "cabling", label: "کابل‌کشی" },
  { value: "protection", label: "حفاظت" },
  { value: "battery", label: "باتری" },
  { value: "other", label: "سایر" },
] as const;

export const EQUIPMENT_PRICE_MODES = [
  { value: "per_kwp", label: "به ازای هر کیلووات‌پیک" },
  { value: "per_unit", label: "به ازای هر واحد" },
  { value: "fixed", label: "ثابت" },
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number]["value"];
export type EquipmentPriceMode = (typeof EQUIPMENT_PRICE_MODES)[number]["value"];

export type EquipmentItem = {
  readonly uuid: string;
  readonly name: string;
  readonly category: EquipmentCategory;
  readonly brand: string;
  readonly power_watts: number | null;
  readonly price_toman: number;
  readonly price_mode: EquipmentPriceMode;
  readonly units_per_kwp: number | string | null;
  readonly is_active: boolean;
  readonly show_in_price_list: boolean;
  readonly created_at: string;
  readonly updated_at: string;
};

export type EquipmentPage = {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: readonly EquipmentItem[];
};

export type EquipmentWrite = {
  readonly name: string;
  readonly category: EquipmentCategory;
  readonly brand: string;
  readonly power_watts: number | null;
  readonly price_toman: number;
  readonly price_mode: EquipmentPriceMode;
  readonly units_per_kwp: number | string | null;
  readonly is_active: boolean;
  readonly show_in_price_list: boolean;
};

export type EquipmentEstimateLine = {
  readonly equipment_uuid: string;
  readonly name: string;
  readonly category: EquipmentCategory | string;
  readonly price_mode: EquipmentPriceMode | string;
  readonly unit_price_toman: number;
  readonly quantity: number | string;
  readonly total_toman: number;
};

export type EquipmentEstimate = {
  readonly capacity_kwp: number | string;
  readonly items: readonly EquipmentEstimateLine[];
  readonly total_toman: number;
};

export async function getEquipment(
  query = "page_size=100&ordering=created_at",
  signal?: AbortSignal,
): Promise<EquipmentPage> {
  const result = await apiRequest<EquipmentPage | readonly EquipmentItem[]>(`/catalog/equipment/?${query}`, {
    auth: true,
    signal,
  });
  return "results" in result ? result : { count: result.length, next: null, previous: null, results: result };
}

export async function getEquipmentItem(uuid: string): Promise<EquipmentItem> {
  return apiRequest<EquipmentItem>(`/catalog/equipment/${uuid}/`, { auth: true });
}

export async function saveEquipment(data: EquipmentWrite, uuid?: string): Promise<EquipmentItem> {
  return apiRequest<EquipmentItem>(uuid ? `/catalog/equipment/${uuid}/` : "/catalog/equipment/", {
    auth: true,
    method: uuid ? "PATCH" : "POST",
    body: data,
  });
}

export async function patchEquipment(uuid: string, data: Partial<EquipmentWrite>): Promise<EquipmentItem> {
  return apiRequest<EquipmentItem>(`/catalog/equipment/${uuid}/`, {
    auth: true,
    method: "PATCH",
    body: data,
  });
}

export async function deleteEquipment(uuid: string): Promise<void> {
  await apiRequest(`/catalog/equipment/${uuid}/`, { auth: true, method: "DELETE" });
}

export async function estimateEquipmentCost(capacityKwp: number | string, signal?: AbortSignal): Promise<EquipmentEstimate> {
  const query = new URLSearchParams({ capacity_kwp: String(capacityKwp) });
  return apiRequest<EquipmentEstimate>(`/catalog/equipment/estimate/?${query}`, { signal });
}

export function equipmentCategoryLabel(value: string): string {
  return EQUIPMENT_CATEGORIES.find((entry) => entry.value === value)?.label ?? value;
}

export function equipmentPriceModeLabel(value: string): string {
  return EQUIPMENT_PRICE_MODES.find((entry) => entry.value === value)?.label ?? value;
}

export function formatEquipmentMoney(value: number | string | null | undefined): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return formatFa(numeric, { maximumFractionDigits: 0 });
}

export function formatEquipmentUnits(value: number | string | null | undefined): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return formatFa(numeric, { maximumFractionDigits: 3 });
}
