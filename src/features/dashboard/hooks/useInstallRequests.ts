"use client";

import { useSyncExternalStore } from "react";
import type { InstallRequest } from "@/shared/types/dashboard";
import { getInstallRequests, subscribeInstall } from "../lib/installStore";

/** Stable empty snapshot for SSR — same reference every call. */
const EMPTY_SNAPSHOT = "[]";

function getClientSnapshot() {
  return JSON.stringify(getInstallRequests());
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

export function useInstallRequests() {
  const snapshot = useSyncExternalStore(subscribeInstall, getClientSnapshot, getServerSnapshot);
  const requests = JSON.parse(snapshot) as InstallRequest[];

  return {
    requests,
    latest: requests[0] ?? null,
  };
}
