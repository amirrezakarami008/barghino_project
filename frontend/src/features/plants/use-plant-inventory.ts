"use client";

import { useEffect, useState } from "react";
import { getBranches, getPlants, plantError, type Branch, type Plant, type Page } from "./plants-api";

type Inventory = { readonly branches: Page<Branch>; readonly plants: Page<Plant> };
type State = { readonly status: "loading" } | { readonly status: "error"; readonly message: string } | { readonly status: "ready"; readonly data: Inventory };
export function usePlantInventory(branchPage: number, plantPage: number): { readonly state: State; readonly reload: () => void } {
  const [attempt, setAttempt] = useState(0);
  const key = `${branchPage}:${plantPage}:${attempt}`;
  const [result, setResult] = useState<{ readonly key: string; readonly state: State }>();
  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([getBranches(branchPage, controller.signal), getPlants(plantPage, controller.signal)]).then(([branches, plants]) => {
      if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data: { branches, plants } } });
    }).catch((error: unknown) => { if (!controller.signal.aborted) setResult({ key, state: { status: "error", message: plantError(error) } }); });
    return () => controller.abort();
  }, [branchPage, plantPage, key]);
  return { state: result?.key === key ? result.state : { status: "loading" }, reload: () => setAttempt((current) => current + 1) };
}
