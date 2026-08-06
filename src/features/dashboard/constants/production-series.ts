import type { ProductionPoint } from "@/shared/types/dashboard";
import { SITE_CONFIG } from "@/config";
import { parsePersianNumber } from "@/shared/lib/numbers";
import { MONTHLY_PRODUCTION } from "./data";

export type ProductionPeriod = "daily" | "weekly" | "monthly";

export const PRODUCTION_PERIODS: {
  id: ProductionPeriod;
  label: string;
  hint: string;
}[] = [
  { id: "daily", label: "روزانه", hint: "۳۰ روز اخیر" },
  { id: "weekly", label: "هفتگی", hint: "۸ هفته اخیر" },
  { id: "monthly", label: "ماهانه", hint: "۶ ماه اخیر" },
];

const RATE = () => parsePersianNumber(SITE_CONFIG.valueProps.barghinoPrice);

/** PRNG پایدار برای داده نمونه */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function toFa(n: number) {
  return n.toLocaleString("fa-IR");
}

function buildPoint(
  label: string,
  shortLabel: string,
  production: number,
  neighbor: number,
  national: number,
): ProductionPoint & { shortLabel: string } {
  const prod = Math.max(1, Math.round(production));
  return {
    label,
    shortLabel,
    production: prod,
    earnings: prod * RATE(),
    neighborProduction: Math.max(1, Math.round(neighbor)),
    nationalProduction: Math.max(1, Math.round(national)),
  };
}

/**
 * ۳۰ روز اخیر — الگوی موج‌دار با نویز ملایم
 * واحد: kWh روزانه
 */
export function getDailyProduction(): Array<ProductionPoint & { shortLabel: string }> {
  const rand = mulberry32(1404_06_30);
  const base = 24;
  const points: Array<ProductionPoint & { shortLabel: string }> = [];

  for (let day = 1; day <= 30; day++) {
    const wave = Math.sin((day / 30) * Math.PI * 2) * 4.5;
    const cloud = rand() > 0.82 ? -(3 + rand() * 8) : rand() * 2.2;
    const own = base + wave + cloud + (rand() - 0.5) * 2;
    const neighbor = own * (0.88 + rand() * 0.14) + (rand() - 0.5) * 1.5;
    const national = own * (0.78 + rand() * 0.12) + (rand() - 0.5) * 1.2;

    points.push(
      buildPoint(`روز ${toFa(day)} شهریور`, toFa(day), own, neighbor, national),
    );
  }

  return points;
}

/** ۸ هفته اخیر — kWh هفتگی */
export function getWeeklyProduction(): Array<ProductionPoint & { shortLabel: string }> {
  const rand = mulberry32(1404_08);
  const bases = [155, 168, 172, 181, 176, 162, 148, 141];

  return bases.map((base, i) => {
    const week = i + 1;
    const jitter = (rand() - 0.5) * 12;
    const own = base + jitter;
    const neighbor = own * (0.9 + rand() * 0.12);
    const national = own * (0.8 + rand() * 0.1);
    return buildPoint(
      `هفته ${toFa(week)}`,
      `هـ${toFa(week)}`,
      own,
      neighbor,
      national,
    );
  });
}

export function getMonthlyProduction(): Array<ProductionPoint & { shortLabel: string }> {
  return MONTHLY_PRODUCTION.map((m) => ({
    ...m,
    shortLabel: m.label.slice(0, 3),
  }));
}

export function getProductionSeries(period: ProductionPeriod) {
  switch (period) {
    case "daily":
      return getDailyProduction();
    case "weekly":
      return getWeeklyProduction();
    case "monthly":
    default:
      return getMonthlyProduction();
  }
}

export function getPeriodMeta(period: ProductionPeriod) {
  const map = {
    daily: {
      title: "مقایسه تولید ۳۰ روز اخیر",
      description: "هر ستون یک روز است — هاور کنید تا جزئیات سه سری را ببینید",
      detailTitle: "جزئیات روز انتخاب‌شده",
      incomeLabel: "درآمد این روز",
      timelineTitle: "نقاط برجسته ۳۰ روز",
      timelineDescription: "بهترین و ضعیف‌ترین روزها + انتخاب سریع",
      unitHint: "kWh / روز",
    },
    weekly: {
      title: "مقایسه تولید ۸ هفته اخیر",
      description: "روند هفتگی نیروگاه شما در برابر اطراف و میانگین کشور",
      detailTitle: "جزئیات هفته انتخاب‌شده",
      incomeLabel: "درآمد این هفته",
      timelineTitle: "جدول زمانی ۸ هفته",
      timelineDescription: "کلیک روی هر هفته، جزئیات مقایسه را به‌روز می‌کند",
      unitHint: "kWh / هفته",
    },
    monthly: {
      title: "مقایسه تولید ۶ ماه اخیر",
      description: "نیروگاه شما در برابر بام‌های اطراف و میانگین کشور",
      detailTitle: "جزئیات ماه انتخاب‌شده",
      incomeLabel: "درآمد این ماه",
      timelineTitle: "جدول زمانی ۶ ماه",
      timelineDescription: "کلیک روی هر ماه، جزئیات مقایسه را به‌روز می‌کند",
      unitHint: "kWh / ماه",
    },
  } as const;

  return map[period];
}
