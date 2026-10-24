const digitMap = "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩";

export function digitsOnly(value: string) {
  const normalized = value.replace(/[۰-۹٠-٩]/g, (digit) => String(digitMap.indexOf(digit) % 10));
  return normalized.replace(/\D/g, "");
}

export function normalizeIranMobile(value: string) {
  let digits = digitsOnly(value);
  if (digits.startsWith("0098")) digits = digits.slice(4);
  else if (digits.startsWith("98") && digits.length >= 12) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("9")) digits = `0${digits}`;
  return digits;
}

export function isIranMobile(value: string) {
  return /^09\d{9}$/.test(normalizeIranMobile(value));
}

export function formatIranMobile(value: string) {
  const phone = normalizeIranMobile(value);
  const grouped = `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
  return grouped.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}
