import { PLANS_STORAGE_KEY, PLANS_UPDATED_EVENT, SEED_PLANS } from "@/features/plans/constants";
import type { ContractPlan } from "@/features/contracts/types";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function withDefaults(plan: ContractPlan): ContractPlan {
  return {
    ...plan,
    active: plan.active ?? true,
    recommended: Boolean(plan.recommended),
    source: plan.source ?? "custom",
    name: plan.name.trim(),
    tagline: plan.tagline.trim(),
    volume: plan.volume.trim(),
    rate: plan.rate.trim(),
    savings: plan.savings.trim(),
    features: (plan.features ?? []).map((f) => f.trim()).filter(Boolean),
    sortOrder: plan.sortOrder ?? 100,
  };
}

export function readStoredPlans(): ContractPlan[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContractPlan[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(withDefaults);
  } catch {
    return [];
  }
}

export function writeStoredPlans(plans: ContractPlan[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  window.dispatchEvent(new Event(PLANS_UPDATED_EVENT));
}

export function getSeedPlans(): ContractPlan[] {
  return SEED_PLANS.map((plan) => withDefaults({ ...plan, source: "seed" }));
}

export function getAllPlans(): ContractPlan[] {
  const byId = new Map<string, ContractPlan>();
  for (const plan of getSeedPlans()) byId.set(plan.id, plan);
  for (const plan of readStoredPlans()) byId.set(plan.id, plan);

  return Array.from(byId.values()).sort((a, b) => {
    const order = (a.sortOrder ?? 100) - (b.sortOrder ?? 100);
    if (order !== 0) return order;
    return a.name.localeCompare(b.name, "fa");
  });
}

export function getActivePlans(): ContractPlan[] {
  return getAllPlans().filter((plan) => plan.active);
}

export function getPlanById(id: string | null | undefined): ContractPlan | null {
  if (!id) return null;
  return getAllPlans().find((plan) => plan.id === id) ?? null;
}

export function getDefaultPlanId(): string | null {
  const active = getActivePlans();
  if (!active.length) return null;
  return active.find((p) => p.recommended)?.id ?? active[0]!.id;
}

export function savePlan(plan: ContractPlan): ContractPlan {
  const normalized = withDefaults({
    ...plan,
    updatedAt: new Date().toISOString(),
    source: plan.source === "seed" ? "custom" : plan.source ?? "custom",
  });

  const overrides = new Map<string, ContractPlan>();
  for (const item of readStoredPlans()) {
    if (item.id !== normalized.id) overrides.set(item.id, item);
  }
  overrides.set(normalized.id, normalized);

  if (normalized.recommended) {
    for (const other of getAllPlans()) {
      if (other.id === normalized.id || !other.recommended) continue;
      const cleared = withDefaults({
        ...other,
        recommended: false,
        source: "custom",
        updatedAt: new Date().toISOString(),
      });
      overrides.set(cleared.id, cleared);
    }
  }

  writeStoredPlans(Array.from(overrides.values()));
  return normalized;
}

export function deletePlan(id: string) {
  const seedIds = new Set(SEED_PLANS.map((p) => p.id));
  writeStoredPlans(readStoredPlans().filter((p) => p.id !== id));
  // برای custom کاملاً حذف می‌شود؛ برای seed با حذف override به مقدار اولیه برمی‌گردد
  if (!seedIds.has(id)) {
    // already removed from stored
  }
}

export function togglePlanActive(id: string, active: boolean) {
  const current = getPlanById(id);
  if (!current) return;
  savePlan({ ...current, active });
}

export function isPlanNameTaken(name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase();
  return getAllPlans().some(
    (plan) => plan.name.trim().toLowerCase() === normalized && plan.id !== excludeId,
  );
}

export function createPlanId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]/gi, "")
    .slice(0, 24);
  const slug = base || "plan";
  const candidate = `plan-${slug}-${Date.now().toString(36).slice(-4)}`;
  return candidate;
}
