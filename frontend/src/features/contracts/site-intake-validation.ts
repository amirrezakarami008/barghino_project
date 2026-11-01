import { latinDigits } from "@/features/plants/plants-api";
import type { Branch, Plant } from "@/features/plants";
import {
  SUSPICIOUS_CAPACITY_KW,
  type SiteIntakeDraft,
  type SiteIntakeFieldId,
} from "./site-intake-types";

const CAPACITY_PATTERN = /^[0-9]+(\.[0-9]{1,3})?$/;

export function normalizeMeterInput(value: string): string {
  return latinDigits(value.replace(/[^\d۰-۹٠-٩]/g, ""));
}

export function normalizeCapacityInput(value: string): string {
  const cleaned = latinDigits(value.replace(/[^\d۰-۹٠-٩.٫]/g, "")).replace("٫", ".");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 3)}`;
}

export function capacityNumber(value: string): number | null {
  const normalized = normalizeCapacityInput(value.trim());
  if (!normalized || !CAPACITY_PATTERN.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function isSuspiciousCapacity(value: string): boolean {
  const n = capacityNumber(value);
  return n !== null && n >= SUSPICIOUS_CAPACITY_KW;
}

export function fieldError(
  field: SiteIntakeFieldId,
  draft: SiteIntakeDraft,
): string | undefined {
  switch (field) {
    case "branch-select":
      return draft.branchMode === "existing" && !draft.branchId ? "یک انشعاب انتخاب کنید." : undefined;
    case "branch-name":
      if (draft.branchMode !== "new") return undefined;
      if (!draft.branchName.trim()) return "نام انشعاب را وارد کنید.";
      if (draft.branchName.trim().length > 150) return "نام انشعاب حداکثر ۱۵۰ نویسه است.";
      return undefined;
    case "branch-meter":
      if (draft.branchMode !== "new") return undefined;
      if (!draft.meter.trim()) return "شماره کنتور را وارد کنید.";
      if (normalizeMeterInput(draft.meter).length > 64) return "شماره کنتور حداکثر ۶۴ نویسه است.";
      return undefined;
    case "branch-address":
      if (draft.branchMode !== "new") return undefined;
      if (!draft.branchAddress.trim()) return "نشانی انشعاب را وارد کنید.";
      if (draft.branchAddress.trim().length > 500) return "نشانی حداکثر ۵۰۰ نویسه است.";
      return undefined;
    case "plant-select":
      return draft.plantMode === "existing" && !draft.plantId ? "یک نیروگاه انتخاب کنید." : undefined;
    case "plant-name":
      if (draft.plantMode !== "new") return undefined;
      if (!draft.plantName.trim()) return "نام نیروگاه را وارد کنید.";
      if (draft.plantName.trim().length > 150) return "نام نیروگاه حداکثر ۱۵۰ نویسه است.";
      return undefined;
    case "plant-address":
      if (draft.plantMode !== "new") return undefined;
      if (!draft.plantAddress.trim()) return "نشانی نیروگاه را وارد کنید.";
      if (draft.plantAddress.trim().length > 500) return "نشانی حداکثر ۵۰۰ نویسه است.";
      return undefined;
    case "plant-capacity": {
      if (draft.plantMode !== "new") return undefined;
      if (!draft.capacity.trim()) return "ظرفیت نصب‌شده را وارد کنید.";
      if (capacityNumber(draft.capacity) === null) {
        return "ظرفیت باید عدد مثبت با حداکثر سه رقم اعشار باشد.";
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

export function collectInvalidFields(draft: SiteIntakeDraft): SiteIntakeFieldId[] {
  const fields: SiteIntakeFieldId[] =
    draft.branchMode === "existing"
      ? ["branch-select"]
      : ["branch-name", "branch-meter", "branch-address"];
  if (draft.plantMode === "existing") fields.push("plant-select");
  else fields.push("plant-name", "plant-address", "plant-capacity");
  return fields.filter((field) => Boolean(fieldError(field, draft)));
}

export function branchSectionValid(draft: SiteIntakeDraft): boolean {
  if (draft.branchMode === "existing") return Boolean(draft.branchId);
  return !fieldError("branch-name", draft) && !fieldError("branch-meter", draft) && !fieldError("branch-address", draft);
}

export function plantSectionValid(draft: SiteIntakeDraft): boolean {
  if (draft.branchMode === "new" && draft.plantMode === "existing") return false;
  if (draft.plantMode === "existing") return Boolean(draft.plantId);
  return !fieldError("plant-name", draft) && !fieldError("plant-address", draft) && !fieldError("plant-capacity", draft);
}

export function intakeFormValid(draft: SiteIntakeDraft): boolean {
  return branchSectionValid(draft) && plantSectionValid(draft);
}

export function findOwnMeterDuplicate(
  meter: string,
  branches: readonly Branch[],
  excludeId?: string,
): Branch | undefined {
  const normalized = normalizeMeterInput(meter.trim());
  if (!normalized) return undefined;
  return branches.find(
    (branch) =>
      branch.uuid !== excludeId &&
      normalizeMeterInput(branch.meter_number) === normalized,
  );
}

export function plantsForBranch(plants: readonly Plant[], branchId: string): Plant[] {
  if (!branchId) return [];
  return plants.filter((plant) => plant.branch_uuid === branchId);
}

export type Completeness = { filled: number; total: number };

export function intakeCompleteness(draft: SiteIntakeDraft): Completeness {
  const checks: boolean[] = [];
  if (draft.branchMode === "existing") {
    checks.push(Boolean(draft.branchId));
  } else {
    checks.push(Boolean(draft.branchName.trim()), Boolean(draft.meter.trim()), Boolean(draft.branchAddress.trim()));
  }
  if (draft.plantMode === "existing") {
    checks.push(Boolean(draft.plantId));
  } else {
    checks.push(
      Boolean(draft.plantName.trim()),
      Boolean(draft.plantAddress.trim()),
      capacityNumber(draft.capacity) !== null,
    );
  }
  return { filled: checks.filter(Boolean).length, total: checks.length };
}
