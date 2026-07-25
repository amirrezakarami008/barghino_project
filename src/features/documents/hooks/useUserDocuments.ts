"use client";

import { DOCUMENTS_EVENT } from "../constants";
import { getAllUserDocuments, getSeedDocuments } from "../lib/store";
import type { UserDocument } from "../types";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DOCUMENTS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DOCUMENTS_EVENT, onStoreChange);
  };
}

function getServerSnapshot() {
  return JSON.stringify(getSeedDocuments());
}

export function useUserDocuments() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getAllUserDocuments()),
    getServerSnapshot,
  );

  return {
    documents: JSON.parse(snapshot) as UserDocument[],
  };
}
