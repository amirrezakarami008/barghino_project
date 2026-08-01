/** تبدیل ارقام فارسی/عربی و جداکننده‌ها به عدد انگلیسی */
export function parsePersianNumber(value: string | number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const normalized = value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[٬,،\s]/g, "");

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
