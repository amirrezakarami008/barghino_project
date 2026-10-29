"use client";

import { useCallback, useEffect, useState } from "react";
import { contractError } from "./contracts-api";
import type { Remote } from "./contract-model";

/** Preserve the current read during refresh, including unsaved interaction below it. */
export function useContractResource<T>(key: string, load: (signal: AbortSignal) => Promise<T>): { readonly state: Remote<T>; readonly refreshing: boolean; readonly refreshError?: string; readonly reload: () => void; readonly replaceData: (data: T) => void } {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ readonly key: string; readonly attempt: number; readonly state: Remote<T>; readonly refreshError?: string }>();
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ key, attempt, state: { status: "ready", data } });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult((current) => current?.key === key && current.state.status === "ready"
        ? { ...current, attempt, refreshError: contractError(error) }
        : { key, attempt, state: { status: "error", message: contractError(error) } });
    });
    return () => controller.abort();
  }, [key, load, attempt]);
  const reload = useCallback(() => setAttempt((current) => current + 1), []);
  return {
    state: result?.key === key ? result.state : { status: "loading" },
    refreshing: !result || result.key !== key || result.attempt !== attempt,
    refreshError: result?.key === key ? result.refreshError : undefined,
    reload,
    replaceData: (data) => setResult({ key, attempt, state: { status: "ready", data } }),
  };
}
