"use client";

import {
  getActivePlans,
  getAllPlans,
  getSeedPlans,
} from "@/features/plans/lib/store";
import { PLANS_UPDATED_EVENT } from "@/features/plans/constants";
import type { ContractPlan } from "@/features/contracts/types";
import { useEffect, useState } from "react";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PLANS_UPDATED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PLANS_UPDATED_EVENT, onStoreChange);
  };
}

/**
 * ابتدا seed را نشان می‌دهد (SSR = کلاینت اولیه)،
 * بعد از mount دادهٔ localStorage را همگام می‌کند تا hydration mismatch نشود.
 */
export function usePlans() {
  const [plans, setPlans] = useState<ContractPlan[]>(() => getSeedPlans());

  useEffect(() => {
    const sync = () => setPlans(getAllPlans());
    sync();
    return subscribe(sync);
  }, []);

  return { plans };
}

export function useActivePlans() {
  const [plans, setPlans] = useState<ContractPlan[]>(() =>
    getSeedPlans().filter((plan) => plan.active),
  );

  useEffect(() => {
    const sync = () => setPlans(getActivePlans());
    sync();
    return subscribe(sync);
  }, []);

  return { plans };
}

export function usePlan(id: string) {
  const { plans } = usePlans();
  return { plan: plans.find((p) => p.id === id) ?? null };
}
