import { digitsOnly } from "@/features/auth/lib/phone";

const companyCoefficients = [29, 27, 23, 19, 17, 29, 27, 23, 19, 17] as const;

export function isNationalId(value: string) {
  const code = digitsOnly(value);
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  const total = [...code.slice(0, 9)].reduce((sum, digit, index) => sum + Number(digit) * (10 - index), 0);
  const remainder = total % 11;
  const expected = remainder < 2 ? remainder : 11 - remainder;
  return check === expected;
}

export function isCompanyNationalId(value: string) {
  const code = digitsOnly(value);
  if (!/^\d{11}$/.test(code)) return false;
  const check = Number(code[10]);
  const offset = Number(code[9]) + 2;
  const total = companyCoefficients.reduce((sum, coefficient, index) => sum + (Number(code[index]) + offset) * coefficient, 0);
  let remainder = total % 11;
  if (remainder === 10) remainder = 0;
  return remainder === check;
}
