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
    billId: text(value.billId || value.meter),
    branchAddress: text(value.branchAddress),
    plantName: text(value.plantName),
    capacity: text(value.capacity),
    schemeType:
      value.schemeType === "residential" || value.schemeType === "non_residential"
        ? value.schemeType
        : "",
    systemType: value.systemType === "on_grid" || value.systemType === "off_grid" ? value.systemType : "",
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

/** Local draft persistence is disabled; save happens only via explicit submit. */
export function writeIntakeDraft(_draft: SiteIntakeDraft): void {
  /* no-op */
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
    draft.billId !== empty.billId ||
    draft.branchAddress !== empty.branchAddress ||
    draft.plantName !== empty.plantName ||
    draft.capacity !== empty.capacity ||
    draft.schemeType !== empty.schemeType ||
    draft.systemType !== empty.systemType ||
    draft.branchId !== empty.branchId ||
    draft.plantId !== empty.plantId ||
    Boolean(draft.createdBranchId) ||
    Boolean(draft.createdPlantId)
  );
}
