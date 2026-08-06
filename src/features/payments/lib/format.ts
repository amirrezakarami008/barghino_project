/** تبدیل مبلغ فارسی/انگلیسی با جداکننده به عدد */
export function parsePersianAmount(amount: string): number {
  const normalized = amount
    .replace(/[٬,]/g, "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatToman(amount: number): string {
  return amount.toLocaleString("fa-IR");
}

export function sumPersianAmounts(amounts: string[]): number {
  return amounts.reduce((acc, a) => acc + parsePersianAmount(a), 0);
}
