"use client";

import { useEffect, useState } from "react";
import { getPlans, type SellPlan } from "./plans-api";

type PlanOverview =
  | { readonly status: "loading" }
  | { readonly status: "error" }
  | { readonly status: "ready"; readonly total: number; readonly active: number; readonly recommended: number; readonly plans: readonly SellPlan[] };

export function usePlanOverview(): { overview: PlanOverview; retry: () => void } {
  const [overview, setOverview] = useState<PlanOverview>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    async function load(): Promise<void> {
      try {
        const [all, active, recommended] = await Promise.all([
          getPlans("page_size=4"),
          getPlans("page_size=1&is_active=true"),
          getPlans("page_size=1&is_recommended=true"),
        ]);
        if (current) setOverview({ status: "ready", total: all.count, active: active.count, recommended: recommended.count, plans: all.results });
      } catch {
        if (current) setOverview({ status: "error" });
      }
    }
    void load();
    return () => { current = false; };
  }, [attempt]);
  function retry(): void {
    setOverview({ status: "loading" });
    setAttempt((value) => value + 1);
  }
  return { overview, retry };
}
