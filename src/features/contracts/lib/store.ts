import {
  ACCEPTED_UPLOAD_TYPES,
  CONTRACTS_EVENT,
  CONTRACTS_STORAGE_KEY,
  MAX_UPLOAD_BYTES,
  SEED_CONTRACTS,
} from "../constants";
import type {
  Contract,
  ContractDocumentView,
  ContractFile,
  ContractFileKind,
  ContractStatus,
} from "../types";
import { deleteFileBlob, saveFileBlob } from "./files";
import { createId, formatFileSize, formatPersianDate } from "./format";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function cloneSeed(): Contract[] {
  return structuredClone(SEED_CONTRACTS);
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONTRACTS_EVENT));
  }
}

function readOverrides(): Contract[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(CONTRACTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Contract[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOverrides(contracts: Contract[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(contracts));
  notify();
}

function mergeContracts(): Contract[] {
  const overrides = readOverrides();
  const byId = new Map<string, Contract>();

  for (const seed of cloneSeed()) byId.set(seed.id, seed);
  for (const item of overrides) byId.set(item.id, item);

  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function persistContract(contract: Contract) {
  const others = readOverrides().filter((c) => c.id !== contract.id);
  writeOverrides([contract, ...others]);
  return contract;
}

export function getSeedContracts(): Contract[] {
  return cloneSeed();
}

export function getAllContracts(): Contract[] {
  return mergeContracts();
}

export function getContractById(id: string): Contract | undefined {
  return mergeContracts().find((c) => c.id === id);
}

export function requestContractRenewal(id: string): Contract | undefined {
  const contract = getContractById(id);
  if (!contract) return undefined;
  if (contract.status !== "active" && contract.status !== "expired") return contract;

  const next: Contract = {
    ...contract,
    renewalRequested: true,
    versions: [
      ...contract.versions,
      {
        id: createId("ver"),
        version: contract.versions.length + 1,
        label: "درخواست تمدید",
        date: formatPersianDate(),
        note: "درخواست تمدید توسط کاربر ثبت شد",
      },
    ],
  };

  return persistContract(next);
}

function guessMimeType(file: File): string {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".doc")) return "application/msword";
  if (name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "";
}

export async function uploadContractFile(
  contractId: string,
  file: File,
  kind: ContractFileKind = "attachment",
): Promise<ContractFile> {
  const mimeType = guessMimeType(file);
  if (!ACCEPTED_UPLOAD_TYPES.includes(mimeType as (typeof ACCEPTED_UPLOAD_TYPES)[number])) {
    throw new Error("فرمت فایل پشتیبانی نمی‌شود. PDF، تصویر یا Word مجاز است.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
  }

  const contract = getContractById(contractId);
  if (!contract) throw new Error("قرارداد یافت نشد.");

  const fileId = createId("file");
  const storageKey = `${contractId}:${fileId}`;
  await saveFileBlob(storageKey, file);

  const nextVersion =
    Math.max(0, ...contract.files.map((f) => f.version), ...contract.versions.map((v) => v.version)) +
    1;

  const meta: ContractFile = {
    id: fileId,
    name: file.name,
    kind,
    mimeType: mimeType || "application/octet-stream",
    size: formatFileSize(file.size),
    sizeBytes: file.size,
    uploadedAt: formatPersianDate(),
    uploadedBy: "user",
    version: nextVersion,
    storageKey,
  };

  const next: Contract = {
    ...contract,
    status: kind === "signed" && contract.status === "pending" ? "active" : contract.status,
    files: [...contract.files, meta],
    versions: [
      ...contract.versions,
      {
        id: createId("ver"),
        version: nextVersion,
        label: kind === "signed" ? "نسخه امضاشده" : kind === "amendment" ? "الحاقیه" : "پیوست کاربر",
        date: meta.uploadedAt,
        note: `بارگذاری فایل «${file.name}»`,
        fileId,
      },
    ],
  };

  persistContract(next);
  return meta;
}

export async function removeContractFile(contractId: string, fileId: string): Promise<void> {
  const contract = getContractById(contractId);
  if (!contract) return;

  const target = contract.files.find((f) => f.id === fileId);
  if (!target || target.uploadedBy !== "user" || !target.storageKey) {
    throw new Error("فقط فایل‌های بارگذاری‌شده توسط کاربر قابل حذف هستند.");
  }

  await deleteFileBlob(target.storageKey);

  const next: Contract = {
    ...contract,
    files: contract.files.filter((f) => f.id !== fileId),
    versions: contract.versions.map((v) =>
      v.fileId === fileId ? { ...v, note: `${v.note} (فایل حذف شد)`, fileId: undefined } : v,
    ),
  };

  persistContract(next);
}

export function getContractDocuments(): ContractDocumentView[] {
  return getAllContracts().flatMap((contract) =>
    contract.files.map((file) => ({
      id: `${contract.id}-${file.id}`,
      contractId: contract.id,
      title: `${file.name.replace(/\.pdf$/i, "")} — ${contract.billAccount}`,
      type: "قرارداد" as const,
      date: file.uploadedAt,
      size: file.size,
      fileId: file.id,
      mimeType: file.mimeType,
      kind: file.kind,
    })),
  );
}

export function getContractStats(contracts: Contract[]) {
  return {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active").length,
    pending: contracts.filter((c) => c.status === "pending").length,
    draft: contracts.filter((c) => c.status === "draft").length,
    expired: contracts.filter((c) => c.status === "expired").length,
    expiresSoon: contracts.filter((c) => c.expiresSoon).length,
    renewalRequested: contracts.filter((c) => c.renewalRequested).length,
  };
}

export function filterContracts(
  contracts: Contract[],
  options: {
    status?: ContractStatus | "all";
    query?: string;
    role?: "personal" | "business";
  },
): Contract[] {
  const status = options.status ?? "all";
  const query = (options.query ?? "").trim().toLowerCase();
  const role = options.role;

  return contracts.filter((contract) => {
    if (status !== "all" && contract.status !== status) return false;
    if (role && contract.roleScope !== "both" && contract.roleScope !== role) return false;
    if (!query) return true;
    return (
      contract.title.toLowerCase().includes(query) ||
      contract.billAccount.toLowerCase().includes(query) ||
      contract.type.toLowerCase().includes(query)
    );
  });
}

export function getExpiryNotifications(contracts: Contract[] = getAllContracts()) {
  return contracts
    .filter((c) => c.expiresSoon && c.status === "active")
    .map((c) => ({
      id: `expiry-${c.id}`,
      title: "هشدار انقضای قرارداد",
      message: `قرارداد «${c.title}» تا ${c.endDate} اعتبار دارد. تمدید را بررسی کنید.`,
      date: formatPersianDate(),
      read: false,
      type: "warning" as const,
      contractId: c.id,
    }));
}
