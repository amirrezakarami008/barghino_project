const persian = "۰۱۲۳۴۵۶۷۸۹";

export function faDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => persian[Number(digit)] ?? digit);
}

/** Persian locale number formatting (٬ thousands). Prefer for UI figures. */
export function formatFa(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("fa-IR", options).format(value);
}

/** @deprecated Prefer formatFa — kept for existing call sites. */
export function faNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return formatFa(value, options);
}

/** Alias used by workspace/admin surfaces. */
export const formatFaNumber = formatFa;
