import type { AccountType } from "../types";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = ARABIC_DIGITS.indexOf(digit);
    if (arabicIndex >= 0) return String(arabicIndex);
    return digit;
  });
}

export function onlyDigits(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "");
}

export function isValidIranMobile(value: string): boolean {
  return /^09\d{9}$/.test(onlyDigits(value));
}

export function isValidNationalId(value: string): boolean {
  const code = onlyDigits(value);
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;

  const check = Number(code[9]);
  const sum = code
    .slice(0, 9)
    .split("")
    .reduce((acc, digit, index) => acc + Number(digit) * (10 - index), 0);
  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

export function isValidCompanyNationalId(value: string): boolean {
  const code = onlyDigits(value);
  return /^\d{8,12}$/.test(code) && !code.startsWith("09");
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 24;
}

export function validateLoginIdentity(
  accountType: AccountType,
  phone: string,
  companyNationalId: string,
): string | undefined {
  if (accountType === "individual") {
    if (!phone.trim()) return "شماره موبایل الزامی است.";
    if (!isValidIranMobile(phone)) return "شماره موبایل معتبر نیست.";
    return undefined;
  }

  if (!companyNationalId.trim()) return "شناسه ملی الزامی است.";
  if (!isValidCompanyNationalId(companyNationalId)) {
    return "شناسه ملی باید بین ۸ تا ۱۲ رقم باشد.";
  }
  return undefined;
}
