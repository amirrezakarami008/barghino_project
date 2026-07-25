import {
  ACCEPTED_DOCUMENT_TYPES,
  DOCUMENTS_EVENT,
  DOCUMENTS_FILES_PREFIX,
  DOCUMENTS_STORAGE_KEY,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from "../constants";
import type { DocumentCategory, UserDocument } from "../types";
import {
  deleteFileBlob,
  getFileBlob,
  saveFileBlob,
} from "@/features/contracts/lib/files";
import {
  createId,
  formatFileSize,
  formatPersianDate,
} from "@/features/contracts/lib/format";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DOCUMENTS_EVENT));
  }
}

function readDocuments(): UserDocument[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDocuments(docs: UserDocument[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
  notify();
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

export function getSeedDocuments(): UserDocument[] {
  return [];
}

export function getAllUserDocuments(): UserDocument[] {
  return readDocuments().sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function getUserDocumentById(id: string): UserDocument | undefined {
  return readDocuments().find((doc) => doc.id === id);
}

export async function uploadUserDocument(
  file: File,
  category: DocumentCategory,
  title?: string,
): Promise<UserDocument> {
  const mimeType = guessMimeType(file);
  if (!ACCEPTED_DOCUMENT_TYPES.includes(mimeType as (typeof ACCEPTED_DOCUMENT_TYPES)[number])) {
    throw new Error("فرمت فایل پشتیبانی نمی‌شود. PDF، تصویر یا Word مجاز است.");
  }
  if (file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
    throw new Error("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
  }

  const id = createId("doc");
  const storageKey = `${DOCUMENTS_FILES_PREFIX}:${id}`;
  await saveFileBlob(storageKey, file);

  const doc: UserDocument = {
    id,
    title: title?.trim() || file.name.replace(/\.[^.]+$/, ""),
    category,
    fileName: file.name,
    mimeType: mimeType || "application/octet-stream",
    size: formatFileSize(file.size),
    sizeBytes: file.size,
    uploadedAt: formatPersianDate(),
    storageKey,
  };

  writeDocuments([doc, ...readDocuments()]);
  return doc;
}

export async function removeUserDocument(id: string): Promise<void> {
  const docs = readDocuments();
  const target = docs.find((doc) => doc.id === id);
  if (!target) return;
  await deleteFileBlob(target.storageKey);
  writeDocuments(docs.filter((doc) => doc.id !== id));
}

export async function resolveUserDocumentBlob(doc: UserDocument): Promise<Blob | null> {
  return getFileBlob(doc.storageKey);
}
