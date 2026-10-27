import { apiRequest } from "@/features/auth/lib/api";

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

export async function getPlans(query: string): Promise<PlanPage> {
  const result = await apiRequest<PlanPage | readonly SellPlan[]>(`/catalog/plans/?${query}`, { auth: true });
  return "results" in result ? result : { count: result.length, next: null, previous: null, results: result };
}

export function formatPlanNumber(value: number | string): string {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 }).format(Number(value));
}
