import {
  EMPTY_INTAKE_DRAFT,
  INTAKE_DRAFT_STORAGE_KEY,
  type SiteIntakeDraft,
} from "./site-intake-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseIntakeDraft(value: unknown): SiteIntakeDraft | null {
  if (!isRecord(value)) return null;
  const branchMode = value.branchMode === "existing" || value.branchMode === "new" ? value.branchMode : null;
  const plantMode = value.plantMode === "existing" || value.plantMode === "new" ? value.plantMode : null;
  if (!branchMode || !plantMode) return null;
  return {
    branchMode,
    plantMode,
    branchId: text(value.branchId),
    plantId: text(value.plantId),
    branchName: text(value.branchName),
    meter: text(value.meter),
    branchAddress: text(value.branchAddress),
    plantName: text(value.plantName),
    plantAddress: text(value.plantAddress),
    capacity: text(value.capacity),
    sameAddress: bool(value.sameAddress),
    capacityAcked: bool(value.capacityAcked),
    createdBranchId: text(value.createdBranchId),
    createdPlantId: text(value.createdPlantId),
  };
}

export function readIntakeDraft(): SiteIntakeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(INTAKE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return parseIntakeDraft(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeIntakeDraft(draft: SiteIntakeDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTAKE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

export function clearIntakeDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(INTAKE_DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function intakeDraftIsDirty(draft: SiteIntakeDraft): boolean {
  const empty = EMPTY_INTAKE_DRAFT;
  return (
    draft.branchName !== empty.branchName ||
    draft.meter !== empty.meter ||
    draft.branchAddress !== empty.branchAddress ||
    draft.plantName !== empty.plantName ||
    draft.plantAddress !== empty.plantAddress ||
    draft.capacity !== empty.capacity ||
    draft.branchId !== empty.branchId ||
    draft.plantId !== empty.plantId ||
    Boolean(draft.createdBranchId) ||
    Boolean(draft.createdPlantId)
  );
}
