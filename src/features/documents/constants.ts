import type { DocumentCategory } from "./types";

export const DOCUMENTS_STORAGE_KEY = "barghma:user-documents-v1";
export const DOCUMENTS_EVENT = "barghma:documents-updated";
export const DOCUMENTS_FILES_PREFIX = "user-doc";

export const MAX_DOCUMENT_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_DOCUMENT_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,application/pdf,image/*";

export const DOCUMENT_CATEGORIES: { id: DocumentCategory; label: string; hint: string }[] = [
  { id: "کارت ملی", label: "کارت ملی", hint: "تصویر یا فایل کارت ملی" },
  { id: "شناسنامه", label: "شناسنامه", hint: "صفحه اول شناسنامه" },
  { id: "اساسنامه", label: "اساسنامه", hint: "مخصوص اشخاص حقوقی" },
  { id: "روزنامه رسمی", label: "روزنامه رسمی", hint: "آخرین تغییرات شرکت" },
  { id: "مجوز", label: "مجوز", hint: "پروانه یا مجوز فعالیت" },
  { id: "گواهی", label: "گواهی", hint: "گواهی‌های رسمی" },
  { id: "سایر", label: "سایر مدارک", hint: "سایر پیوست‌های مورد نیاز" },
];
