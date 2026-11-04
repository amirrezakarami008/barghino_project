import type { Branch, Plant, SchemeType, SystemType } from "@/features/plants";

/** TODO(product): confirm suspicious capacity threshold with product. */
export const SUSPICIOUS_CAPACITY_KW = 1000;

export type BranchMode = "existing" | "new";
export type PlantMode = "existing" | "new";
export type IntakeSection = "branch" | "plant";

export type SiteIntakeDraft = {
  branchMode: BranchMode;
  plantMode: PlantMode;
  branchId: string;
  plantId: string;
  branchName: string;
  billId: string;
  branchAddress: string;
  plantName: string;
  capacity: string;
  schemeType: SchemeType | "";
  systemType: SystemType | "";
  /** User confirmed a high capacity value is intentional. */
  capacityAcked: boolean;
  /** Idempotent retry: branch already created on a prior attempt. */
  createdBranchId: string;
  createdPlantId: string;
};

export type SiteIntakeFieldId =
  | "branch-name"
  | "branch-bill"
  | "branch-address"
  | "plant-name"
  | "plant-capacity"
  | "plant-scheme"
  | "plant-system"
  | "branch-select"
  | "plant-select";

export type SiteIntakeSubmitIssue =
  | { readonly kind: "none" }
  | { readonly kind: "validation"; readonly fields: readonly SiteIntakeFieldId[] }
  | { readonly kind: "network" }
  | { readonly kind: "partial" }
  | { readonly kind: "conflict" }
  | { readonly kind: "session" }
  | { readonly kind: "generic"; readonly message: string };

export type SiteIntakeAlertState = {
  readonly draft: SiteIntakeDraft;
  readonly branches: readonly Branch[];
  readonly plants: readonly Plant[];
  readonly occupiedBranchIds: ReadonlySet<string>;
  readonly selectedBranch: Branch | undefined;
  readonly selectedPlant: Plant | undefined;
  readonly submitIssue: SiteIntakeSubmitIssue;
  readonly draftRestored: boolean;
  readonly online: boolean;
};

export const EMPTY_INTAKE_DRAFT: SiteIntakeDraft = {
  branchMode: "new",
  plantMode: "new",
  branchId: "",
  plantId: "",
  branchName: "",
  billId: "",
  branchAddress: "",
  plantName: "",
  capacity: "",
  schemeType: "",
  systemType: "",
  capacityAcked: false,
  createdBranchId: "",
  createdPlantId: "",
};

export const INTAKE_DRAFT_STORAGE_KEY = "barghini.contract-site-draft.v1";
