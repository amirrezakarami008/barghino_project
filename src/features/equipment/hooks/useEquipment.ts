"use client";

import {
  getActiveEquipment,
  getAllEquipment,
  getEquipmentById,
  getPriceListEquipment,
  getSeedEquipment,
} from "@/features/equipment/lib/store";
import type { EquipmentItem } from "@/shared/types/equipment";
import { useEffect, useState } from "react";
import { EQUIPMENT_UPDATED_EVENT } from "@/features/equipment/constants";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(EQUIPMENT_UPDATED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(EQUIPMENT_UPDATED_EVENT, onStoreChange);
  };
}

/** SSR و رندر اولیه کلاینت فقط seed — بعد از mount با localStorage همگام می‌شود */
export function useEquipment() {
  const [items, setItems] = useState<EquipmentItem[]>(() => getSeedEquipment());

  useEffect(() => {
    const sync = () => setItems(getAllEquipment());
    sync();
    return subscribe(sync);
  }, []);

  return { items };
}

export function useActiveEquipment() {
  const [items, setItems] = useState<EquipmentItem[]>(() =>
    getSeedEquipment().filter((item) => item.active),
  );

  useEffect(() => {
    const sync = () => setItems(getActiveEquipment());
    sync();
    return subscribe(sync);
  }, []);

  return { items };
}

export function usePriceListEquipment() {
  const [items, setItems] = useState<EquipmentItem[]>(() =>
    getSeedEquipment().filter((item) => item.showInPriceList),
  );

  useEffect(() => {
    const sync = () => setItems(getPriceListEquipment());
    sync();
    return subscribe(sync);
  }, []);

  return { items };
}

export function useEquipmentItem(id: string) {
  const { items } = useEquipment();
  return {
    item: items.find((e) => e.id === id) ?? getEquipmentById(id),
  };
}
