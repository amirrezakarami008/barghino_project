"use client";

import { useSyncExternalStore } from "react";
import type { SolarPlant } from "@/shared/types/dashboard";
import { getAllPlants, subscribePlants } from "@/features/dashboard/lib/plantStore";
import { SOLAR_PLANTS } from "@/features/dashboard/constants/data";

const EMPTY_SNAPSHOT = JSON.stringify(SOLAR_PLANTS);

function getClientSnapshot() {
  return JSON.stringify(getAllPlants());
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

export function useSolarPlants() {
  const snapshot = useSyncExternalStore(subscribePlants, getClientSnapshot, getServerSnapshot);
  const plants = JSON.parse(snapshot) as SolarPlant[];
  return { plants, primary: plants[0] ?? null };
}
