import { apiRequest } from "@/features/auth/lib/api";
import { faNumber } from "@/shared/lib/fa";

export type SellPlan = {
  readonly uuid: string;
  readonly name: string;
  readonly description: string;
  readonly commitment_kwh: number | string;
  readonly rate_toman_per_kwh: number | string;
  readonly savings_text: string;
  readonly benefits: readonly string[];
  readonly is_recommended: boolean;
  readonly is_active: boolean;
  readonly sort_order: number;
};

export type PlanPage = {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: readonly SellPlan[];
};

export type PlanWrite = {
  readonly name: string;
  readonly description: string;
  readonly commitment_kwh: string | number;
  readonly rate_toman_per_kwh: string | number;
  readonly savings_text: string;
  readonly benefits: readonly string[];
  readonly is_recommended: boolean;
  readonly is_active: boolean;
  readonly sort_order: number;
};

export async function getPlans(query: string): Promise<PlanPage> {
  const result = await apiRequest<PlanPage | readonly SellPlan[]>(`/catalog/plans/?${query}`, { auth: true });
  return "results" in result ? result : { count: result.length, next: null, previous: null, results: result };
}

export async function savePlan(data: PlanWrite, uuid?: string): Promise<SellPlan> {
  return apiRequest<SellPlan>(uuid ? `/catalog/plans/${uuid}/` : "/catalog/plans/", {
    auth: true,
    method: uuid ? "PATCH" : "POST",
    body: data,
  });
}

export async function patchPlan(uuid: string, data: Partial<PlanWrite>): Promise<SellPlan> {
  return apiRequest<SellPlan>(`/catalog/plans/${uuid}/`, {
    auth: true,
    method: "PATCH",
    body: data,
  });
}

export async function deletePlan(uuid: string): Promise<void> {
  await apiRequest(`/catalog/plans/${uuid}/`, { auth: true, method: "DELETE" });
}

export function formatPlanNumber(value: number | string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return faNumber(numeric, { maximumFractionDigits: 3 });
}
