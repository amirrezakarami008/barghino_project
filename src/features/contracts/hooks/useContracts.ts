"use client";

import { CONTRACTS_EVENT } from "../constants";
import { getAllContracts, getSeedContracts } from "../lib/store";
import type { Contract } from "../types";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CONTRACTS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CONTRACTS_EVENT, onStoreChange);
  };
}

/** Stable SSR/hydration snapshot — never reads localStorage. */
function getServerSnapshot() {
  return JSON.stringify(getSeedContracts());
}

export function useContracts() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getAllContracts()),
    getServerSnapshot,
  );

  return {
    contracts: JSON.parse(snapshot) as Contract[],
  };
}

export function useContract(id: string) {
  const { contracts } = useContracts();
  return {
    contract: contracts.find((c) => c.id === id),
  };
}
