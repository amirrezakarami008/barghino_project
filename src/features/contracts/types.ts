export type ContractStatus = "active" | "pending" | "expired" | "draft" | "cancelled";

export type ContractFileKind = "system" | "signed" | "attachment" | "amendment";

/** شناسه پلن — پلن‌های ادمین می‌توانند id دلخواه داشته باشند */
export type ContractPlanId = string;

export interface ContractPlan {
  id: ContractPlanId;
  name: string;
  tagline: string;
  volume: string;
  rate: string;
  savings: string;
  features: string[];
  recommended?: boolean;
  /** در ویزارد انتخاب پلن نمایش داده شود */
  active: boolean;
  sortOrder?: number;
  source?: "seed" | "custom";
  updatedAt?: string;
}

export interface ContractFile {
  id: string;
  name: string;
  kind: ContractFileKind;
  mimeType: string;
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: "system" | "user";
  version: number;
  /** IndexedDB key for user-uploaded blobs */
  storageKey?: string;
  /** Seed files are generated on download/preview */
  isSeed?: boolean;
}

export interface ContractVersion {
  id: string;
  version: number;
  label: string;
  date: string;
  note: string;
  fileId?: string;
}

/** اطلاعات هویتی و امضای طرف قرارداد */
export interface ContractPartyInfo {
  fullName: string;
  nationalId: string;
  birthCertificateNumber: string;
  phone: string;
  address: string;
  /** کلید IndexedDB تصویر کارت ملی */
  nationalIdPhotoStorageKey?: string;
  /** امضای دیجیتال به صورت data URL */
  signatureDataUrl?: string;
  signedAt?: string;
  contractNumber?: string;
}

export interface Contract {
  id: string;
  title: string;
  billAccount: string;
  type: string;
  startDate: string;
  endDate: string;
  volume: string;
  rate: string;
  status: ContractStatus;
  savings: string;
  roleScope: "personal" | "business" | "both";
  renewalRequested?: boolean;
  expiresSoon?: boolean;
  files: ContractFile[];
  versions: ContractVersion[];
  notes?: string;
  /** پلن انتخاب‌شده هنگام امضا */
  planId?: ContractPlanId;
  planName?: string;
  /** پس از تکمیل ویزارد امضا پر می‌شود */
  party?: ContractPartyInfo;
}

export type ContractStatusFilter = "all" | ContractStatus;

export interface ContractDocumentView {
  id: string;
  contractId: string;
  title: string;
  type: "قرارداد";
  date: string;
  size: string;
  fileId: string;
  mimeType: string;
  kind: ContractFileKind;
}

export type ContractSigningStep =
  | "intro"
  | "plan"
  | "identity"
  | "id-photo"
  | "review"
  | "signature"
  | "done";

export interface ContractSigningDraft {
  planId: ContractPlanId | null;
  fullName: string;
  nationalId: string;
  birthCertificateNumber: string;
  phone: string;
  address: string;
  nationalIdPhoto: File | null;
  nationalIdPhotoPreview: string | null;
  signatureDataUrl: string | null;
  acceptedTerms: boolean;
}
