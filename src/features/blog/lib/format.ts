const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function slugifyTitle(title: string): string {
  const cleaned = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || `post-${Date.now()}`;
}

/** Approximate Jalali date label for display (demo frontend). */
export function formatPersianDate(date = new Date()): string {
  try {
    const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
    return formatted.replace(/\//g, "/");
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return toPersianDigits(`${y}/${m}/${d}`);
  }
}

export function estimateReadTime(paragraphCount: number, listCount = 0): string {
  const minutes = Math.max(3, Math.round(paragraphCount * 1.4 + listCount * 0.3));
  return `${toPersianDigits(minutes)} دقیقه`;
}
