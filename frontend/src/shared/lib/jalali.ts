/** Jalali (Persian) calendar helpers. API dates stay Gregorian ISO `YYYY-MM-DD`. */

export type JalaliParts = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

const GREGORIAN_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b;
}

/** Algorithm from jalaali-js (MIT). */
function gregorianToJalali(gy: number, gm: number, gd: number): JalaliParts {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) +
    gd +
    gdm[gm - 1]!;
  let jy = -1595 + 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { year: jy, month: jm, day: jd };
}

/** Algorithm from jalaali-js (MIT). */
function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    div(jy, 33) * 8 +
    div(mod(jy, 33) + 3, 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * div(days, 146097);
  days = mod(days, 146097);
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days = mod(days, 36524);
    if (days >= 365) days += 1;
  }
  gy += 4 * div(days, 1461);
  days = mod(days, 1461);
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const salA = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 1; gm <= 12 && gd > salA[gm]!; gm += 1) gd -= salA[gm]!;
  return { gy, gm, gd };
}

/** Leap when 30 Esfand round-trips through the same conversion algorithm. */
export function isJalaliLeap(year: number): boolean {
  const { gy, gm, gd } = jalaliToGregorian(year, 12, 30);
  const back = gregorianToJalali(gy, gm, gd);
  return back.year === year && back.month === 12 && back.day === 30;
}

export function jalaliMonthLength(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeap(year) ? 30 : 29;
}

export function parseGregorianIso(value: string): { gy: number; gm: number; gd: number } | null {
  const match = GREGORIAN_ISO.exec(value.trim());
  if (!match) return null;
  const gy = Number(match[1]);
  const gm = Number(match[2]);
  const gd = Number(match[3]);
  const date = new Date(Date.UTC(gy, gm - 1, gd));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== gy ||
    date.getUTCMonth() + 1 !== gm ||
    date.getUTCDate() !== gd
  ) {
    return null;
  }
  return { gy, gm, gd };
}

export function gregorianIsoToJalali(value: string): JalaliParts | null {
  const parsed = parseGregorianIso(value);
  if (!parsed) return null;
  return gregorianToJalali(parsed.gy, parsed.gm, parsed.gd);
}

export function jalaliToGregorianIso(parts: JalaliParts): string | null {
  const { year, month, day } = parts;
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > jalaliMonthLength(year, month)
  ) {
    return null;
  }
  const { gy, gm, gd } = jalaliToGregorian(year, month, day);
  return `${String(gy).padStart(4, "0")}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export function todayJalali(): JalaliParts {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function jalaliYearOptions(minYear = 1300, maxYear = todayJalali().year): number[] {
  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year -= 1) years.push(year);
  return years;
}
