import { latinDigits } from "@/features/plants/plants-api";
import type { Branch, Plant } from "@/features/plants";
import { isSchemeType, isSystemType } from "@/features/plants/plant-options";
import {
  SUSPICIOUS_CAPACITY_KW,
  type SiteIntakeDraft,
  type SiteIntakeFieldId,
} from "./site-intake-types";

const CAPACITY_PATTERN = /^[0-9]+(\.[0-9]{1,3})?$/;

export function normalizeBillIdInput(value: string): string {
  return latinDigits(value.replace(/[^\d۰-۹٠-٩]/g, ""));
}

/** @deprecated Use normalizeBillIdInput */
export const normalizeMeterInput = normalizeBillIdInput;

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

export type IntakeValidationContext = {
  readonly occupiedBranchIds?: ReadonlySet<string>;
};

export function fieldError(
  field: SiteIntakeFieldId,
  draft: SiteIntakeDraft,
  context: IntakeValidationContext = {},
): string | undefined {
  switch (field) {
    case "branch-select":
      if (draft.branchMode !== "existing") return undefined;
      if (!draft.branchId) return "یک انشعاب انتخاب کنید.";
      if (context.occupiedBranchIds?.has(draft.branchId)) {
        return "این انشعاب در قرارداد دیگری استفاده شده و قابل انتخاب مجدد نیست.";
      }
      return undefined;
    case "branch-name":
      if (draft.branchMode !== "new") return undefined;
      if (!draft.branchName.trim()) return "نام انشعاب را وارد کنید.";
      if (draft.branchName.trim().length > 150) return "نام انشعاب حداکثر ۱۵۰ نویسه است.";
      return undefined;
    case "branch-bill":
      if (draft.branchMode !== "new") return undefined;
      if (!draft.billId.trim()) return "شناسه قبض را وارد کنید.";
      if (normalizeBillIdInput(draft.billId).length > 64) return "شناسه قبض حداکثر ۶۴ نویسه است.";
      return undefined;
    case "branch-address":
      if (draft.branchMode !== "new") return undefined;
      if (!draft.branchAddress.trim()) return "نشانی انشعاب را وارد کنید.";
      if (draft.branchAddress.trim().length > 500) return "نشانی حداکثر ۵۰۰ نویسه است.";
      return undefined;
    case "plant-select":
      return draft.plantMode === "existing" && !draft.plantId ? "یک نیروگاه انتخاب کنید." : undefined;
    case "plant-name":
      return undefined;
    case "plant-capacity": {
      if (draft.plantMode !== "new") return undefined;
      if (!draft.capacity.trim()) return "ظرفیت نصب‌شده را وارد کنید.";
      if (capacityNumber(draft.capacity) === null) {
        return "ظرفیت باید عدد مثبت با حداکثر سه رقم اعشار باشد.";
      }
      return undefined;
    }
    case "plant-scheme":
      if (draft.plantMode !== "new") return undefined;
      return isSchemeType(draft.schemeType) ? undefined : "کاربری طرح را انتخاب کنید.";
    case "plant-system":
      if (draft.plantMode !== "new") return undefined;
      return isSystemType(draft.systemType) ? undefined : "نوع اتصال به شبکه را انتخاب کنید.";
    default:
      return undefined;
  }
}

export function collectInvalidBranchFields(
  draft: SiteIntakeDraft,
  context: IntakeValidationContext = {},
): SiteIntakeFieldId[] {
  const fields: SiteIntakeFieldId[] =
    draft.branchMode === "existing"
      ? ["branch-select"]
      : ["branch-name", "branch-bill", "branch-address"];
  return fields.filter((field) => Boolean(fieldError(field, draft, context)));
}

export function collectInvalidPlantFields(
  draft: SiteIntakeDraft,
  context: IntakeValidationContext = {},
): SiteIntakeFieldId[] {
  const fields: SiteIntakeFieldId[] =
    draft.plantMode === "existing"
      ? ["plant-select"]
      : ["plant-scheme", "plant-system", "plant-capacity"];
  return fields.filter((field) => Boolean(fieldError(field, draft, context)));
}

export function collectInvalidFields(
  draft: SiteIntakeDraft,
  context: IntakeValidationContext = {},
): SiteIntakeFieldId[] {
  return [...collectInvalidBranchFields(draft, context), ...collectInvalidPlantFields(draft, context)];
}

export function branchSectionValid(
  draft: SiteIntakeDraft,
  context: IntakeValidationContext = {},
): boolean {
  if (draft.branchMode === "existing") {
    return Boolean(draft.branchId) && !context.occupiedBranchIds?.has(draft.branchId);
  }
  return (
    !fieldError("branch-name", draft, context) &&
    !fieldError("branch-bill", draft, context) &&
    !fieldError("branch-address", draft, context)
  );
}

export function plantSectionValid(draft: SiteIntakeDraft): boolean {
  if (draft.branchMode === "new" && draft.plantMode === "existing") return false;
  if (draft.plantMode === "existing") return Boolean(draft.plantId);
  return (
    !fieldError("plant-scheme", draft) &&
    !fieldError("plant-system", draft) &&
    !fieldError("plant-capacity", draft)
  );
}

export function intakeFormValid(draft: SiteIntakeDraft): boolean {
  return branchSectionValid(draft) && plantSectionValid(draft);
}

export function findOwnBillDuplicate(
  billId: string,
  branches: readonly Branch[],
  excludeId?: string,
): Branch | undefined {
  const normalized = normalizeBillIdInput(billId.trim());
  if (!normalized) return undefined;
  return branches.find(
    (branch) =>
      branch.uuid !== excludeId &&
      normalizeBillIdInput(branch.bill_id) === normalized,
  );
}

/** @deprecated Use findOwnBillDuplicate */
export const findOwnMeterDuplicate = findOwnBillDuplicate;

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
    checks.push(Boolean(draft.branchName.trim()), Boolean(draft.billId.trim()), Boolean(draft.branchAddress.trim()));
  }
  if (draft.plantMode === "existing") {
    checks.push(Boolean(draft.plantId));
  } else {
    checks.push(
      isSchemeType(draft.schemeType),
      isSystemType(draft.systemType),
      capacityNumber(draft.capacity) !== null,
    );
  }
  return { filled: checks.filter(Boolean).length, total: checks.length };
}
