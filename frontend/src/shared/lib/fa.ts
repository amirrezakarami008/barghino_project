const persian = "۰۱۲۳۴۵۶۷۸۹";

export function faDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => persian[Number(digit)] ?? digit);
}
