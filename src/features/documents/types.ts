export type DocumentCategory =
  | "کارت ملی"
  | "شناسنامه"
  | "اساسنامه"
  | "روزنامه رسمی"
  | "مجوز"
  | "گواهی"
  | "سایر";

export interface UserDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  storageKey: string;
}
