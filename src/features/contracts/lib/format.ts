const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function formatPersianDate(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return toPersianDigits(`${y}/${m}/${d}`);
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return toPersianDigits(`${bytes} B`);
  if (bytes < 1024 * 1024) {
    return `${toPersianDigits((bytes / 1024).toFixed(0))} KB`;
  }
  return `${toPersianDigits((bytes / (1024 * 1024)).toFixed(1))} MB`;
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
