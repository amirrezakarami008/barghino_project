import {
  EQUIPMENT_STORAGE_KEY,
  EQUIPMENT_UPDATED_EVENT,
  SEED_EQUIPMENT,
} from "@/features/equipment/constants";
import type { EquipmentItem } from "@/shared/types/equipment";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function withDefaults(item: EquipmentItem): EquipmentItem {
  return {
    ...item,
    active: item.active ?? true,
    showInPriceList: item.showInPriceList ?? true,
    source: item.source ?? "custom",
    name: item.name.trim(),
    brand: item.brand.trim(),
    unitPriceToman: Math.max(0, Math.round(item.unitPriceToman)),
  };
}

export function readStoredEquipment(): EquipmentItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EquipmentItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(withDefaults);
  } catch {
    return [];
  }
}

export function writeStoredEquipment(items: EquipmentItem[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EQUIPMENT_UPDATED_EVENT));
}

export function getSeedEquipment(): EquipmentItem[] {
  return SEED_EQUIPMENT.map((item) =>
    withDefaults({
      ...item,
      source: "seed",
    }),
  );
}

/** ادغام seed با overrideهای ذخیره‌شده (بر اساس id) */
export function getAllEquipment(): EquipmentItem[] {
  const stored = readStoredEquipment();
  const byId = new Map<string, EquipmentItem>();

  for (const item of getSeedEquipment()) byId.set(item.id, item);
  for (const item of stored) byId.set(item.id, item);

  return Array.from(byId.values()).sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return a.name.localeCompare(b.name, "fa");
  });
}

export function getActiveEquipment(): EquipmentItem[] {
  return getAllEquipment().filter((item) => item.active);
}

export function getPriceListEquipment(): EquipmentItem[] {
  return getAllEquipment().filter((item) => item.showInPriceList);
}

export function getEquipmentById(id: string): EquipmentItem | undefined {
  return getAllEquipment().find((item) => item.id === id);
}

export function saveEquipment(item: EquipmentItem): EquipmentItem {
  const normalized = withDefaults({
    ...item,
    updatedAt: new Date().toISOString(),
    source: item.source === "seed" ? "custom" : item.source ?? "custom",
  });
  const existing = readStoredEquipment().filter((e) => e.id !== normalized.id);
  writeStoredEquipment([normalized, ...existing]);
  return normalized;
}

export function deleteEquipment(id: string) {
  const seedIds = new Set(SEED_EQUIPMENT.map((e) => e.id));

  if (seedIds.has(id)) {
    // برای seed: override را حذف کن تا به مقدار اولیه برگردد
    writeStoredEquipment(readStoredEquipment().filter((e) => e.id !== id));
    return;
  }

  writeStoredEquipment(readStoredEquipment().filter((e) => e.id !== id));
}

export function toggleEquipmentActive(id: string, active: boolean) {
  const current = getEquipmentById(id);
  if (!current) return;
  saveEquipment({ ...current, active });
}

export function isEquipmentNameTaken(name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase();
  return getAllEquipment().some(
    (item) => item.name.trim().toLowerCase() === normalized && item.id !== excludeId,
  );
}
