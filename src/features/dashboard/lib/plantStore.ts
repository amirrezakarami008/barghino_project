import type { SolarPlant } from "@/shared/types/dashboard";
import { SOLAR_PLANTS } from "@/features/dashboard/constants/data";

export const PLANT_STORAGE_KEY = "barghino:custom-plants-v1";
export const PLANT_EVENT = "barghino:plants-updated";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PLANT_EVENT));
}

export function getCustomPlants(): SolarPlant[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(PLANT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SolarPlant[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllPlants(): SolarPlant[] {
  const custom = getCustomPlants();
  const byId = new Map<string, SolarPlant>();
  for (const plant of SOLAR_PLANTS) byId.set(plant.id, plant);
  for (const plant of custom) byId.set(plant.id, plant);
  return Array.from(byId.values());
}

export function getPlantById(id: string): SolarPlant | undefined {
  return getAllPlants().find((p) => p.id === id);
}

export function saveCustomPlant(plant: SolarPlant): SolarPlant {
  if (!canUseStorage()) return plant;
  const others = getCustomPlants().filter((p) => p.id !== plant.id);
  localStorage.setItem(PLANT_STORAGE_KEY, JSON.stringify([plant, ...others]));
  emit();
  return plant;
}

export function subscribePlants(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PLANT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PLANT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
