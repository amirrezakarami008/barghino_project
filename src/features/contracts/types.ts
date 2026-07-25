export type ContractStatus = "active" | "pending" | "expired" | "draft" | "cancelled";

export type ContractFileKind = "system" | "signed" | "attachment" | "amendment";

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
