import { SITE_CONFIG } from "@/config";
import { SOLAR_PLANTS } from "@/features/dashboard/constants";
import type { ProductionPeriod } from "@/features/dashboard/constants/production-series";
import { getAllPlantHealth } from "@/features/dashboard/lib/assistant";
import { parsePersianNumber } from "@/shared/lib/numbers";
import type { ProductionPoint } from "@/shared/types/dashboard";

const rate = () => parsePersianNumber(SITE_CONFIG.valueProps.barghinoPrice);

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pctDiff(own: number, other: number) {
  if (!other) return 0;
  return ((own - other) / other) * 100;
}

export type AnalysisStatus = "good" | "ok" | "attention";

export type AnalysisFactorSeverity = "low" | "medium" | "high";

export interface ProductionAnalysisFactor {
  id: string;
  title: string;
  severity: AnalysisFactorSeverity;
  impactLabel: string;
  detail: string;
}

export interface ProductionAnalysis {
  status: AnalysisStatus;
  statusLabel: string;
  headline: string;
  summary: string;
  periodLabel: string;
  gaps: {
    vsNeighborPct: number;
    vsNationalPct: number;
    vsExpectedPct: number;
    lostKwhVsNeighbor: number;
    lostIncomeVsNeighbor: number;
  };
  highlights: {
    best: { label: string; production: number; note: string };
    worst: { label: string; production: number; note: string };
  };
  factors: ProductionAnalysisFactor[];
  action: {
    title: string;
    description: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
  };
}

/**
 * تحلیل عملکرد تولید برای بازه انتخاب‌شده
 * — شکاف نسبت به اطراف/کشور، عوامل اثرگذار، فرصت درآمد ازدست‌رفته
 */
export function getProductionAnalysis(
  period: ProductionPeriod,
  series: ProductionPoint[],
): ProductionAnalysis {
  const ownTotal = series.reduce((a, p) => a + p.production, 0);
  const neighborTotal = series.reduce((a, p) => a + (p.neighborProduction ?? 0), 0);
  const nationalTotal = series.reduce((a, p) => a + (p.nationalProduction ?? 0), 0);

  const vsNeighborPct = Number(pctDiff(ownTotal, neighborTotal).toFixed(1));
  const vsNationalPct = Number(pctDiff(ownTotal, nationalTotal).toFixed(1));

  const lostKwhVsNeighbor = Math.max(0, Math.round(neighborTotal - ownTotal));
  const lostIncomeVsNeighbor = lostKwhVsNeighbor * rate();

  const capacityKwp = SOLAR_PLANTS.reduce((a, p) => a + p.capacityKwp, 0);
  // بازده تقریبی فصلی: روزانه ~۴ kWh/kWp · هفتگی ~۲۸ · ماهانه ~۱۲۰
  const expectedPerKwp =
    period === "daily"
      ? 4 * series.length
      : period === "weekly"
        ? 28 * series.length
        : 120 * series.length;
  const expectedTotal = capacityKwp * expectedPerKwp;
  const vsExpectedPct = expectedTotal
    ? Number((((ownTotal - expectedTotal) / expectedTotal) * 100).toFixed(1))
    : 0;

  const best = series.reduce((b, p) => (p.production > b.production ? p : b), series[0]!);
  const worst = series.reduce((w, p) => (p.production < w.production ? p : w), series[0]!);
  const bestGap = pctDiff(best.production, best.neighborProduction ?? best.production);
  const worstGap = pctDiff(worst.production, worst.neighborProduction ?? worst.production);

  const healthList = getAllPlantHealth();
  const washHigh = healthList.filter((h) => h.washRisk === "زیاد");
  const washMed = healthList.filter((h) => h.washRisk === "متوسط");
  const avgHealth = avg(healthList.map((h) => h.score));

  const cloudyDays = series.filter((p) => {
    const n = p.neighborProduction ?? p.production;
    return p.production < n * 0.9;
  }).length;

  const periodLabel =
    period === "daily" ? "۳۰ روز اخیر" : period === "weekly" ? "۸ هفته اخیر" : "۶ ماه اخیر";

  const unitWord = period === "daily" ? "روز" : period === "weekly" ? "هفته" : "ماه";

  let status: AnalysisStatus = "good";
  let statusLabel = "وضعیت خوب";
  if (vsNeighborPct < -8 || avgHealth < 75 || washHigh.length > 0) {
    status = "attention";
    statusLabel = "نیاز به توجه";
  } else if (vsNeighborPct < -2 || washMed.length > 0 || vsExpectedPct < -5) {
    status = "ok";
    statusLabel = "قابل قبول";
  }

  const neighborPhrase =
    vsNeighborPct >= 0
      ? `${Math.abs(vsNeighborPct).toLocaleString("fa-IR")}٪ بالاتر از بام‌های اطراف`
      : `${Math.abs(vsNeighborPct).toLocaleString("fa-IR")}٪ پایین‌تر از بام‌های اطراف`;

  const headline =
    status === "attention"
      ? `تولید ${neighborPhrase} است — یک اقدام می‌تواند فاصله را کم کند.`
      : status === "ok"
        ? `عملکرد ${neighborPhrase}؛ با چند اصلاح کوچک به اوج نزدیک می‌شوی.`
        : `عملکرد قوی — ${neighborPhrase}.`;

  const summaryParts = [
    `در ${periodLabel} حدود ${ownTotal.toLocaleString("fa-IR")} kWh تولید کردی.`,
  ];
  if (lostKwhVsNeighbor > 0) {
    summaryParts.push(
      `اگر به میانگین اطراف می‌رسیدی، حدود ${(lostIncomeVsNeighbor / 1_000_000).toLocaleString(
        "fa-IR",
        { maximumFractionDigits: 1 },
      )} میلیون تومان درآمد بیشتر داشتی.`,
    );
  } else {
    summaryParts.push("نسبت به بام‌های اطراف جلوتری و فرصت ازدست‌رفته‌ای دیده نمی‌شود.");
  }

  const factors: ProductionAnalysisFactor[] = [];

  if (washHigh.length || washMed.length) {
    const plants = [...washHigh, ...washMed].map((h) => h.plantName).join(" و ");
    factors.push({
      id: "wash",
      title: "آلودگی پنل",
      severity: washHigh.length ? "high" : "medium",
      impactLabel: washHigh.length ? "تا حدود ۵٪ تولید" : "تا حدود ۳٪ تولید",
      detail: `${plants}: ریسک شستشو ${washHigh.length ? "زیاد" : "متوسط"} است.`,
    });
  }

  if (cloudyDays >= Math.max(2, Math.round(series.length * 0.15))) {
    factors.push({
      id: "weather",
      title: "آب‌وهوا و تابش",
      severity: cloudyDays >= series.length * 0.3 ? "high" : "medium",
      impactLabel: `${cloudyDays.toLocaleString("fa-IR")} ${unitWord} ضعیف‌تر`,
      detail: `در چند ${unitWord} تولید از اطراف عقب افتاده — الگوی ابر/گردوغبار محتمل است.`,
    });
  }

  if (avgHealth < 85) {
    factors.push({
      id: "health",
      title: "سلامت نیروگاه",
      severity: avgHealth < 75 ? "high" : "medium",
      impactLabel: `میانگین سلامت ${Math.round(avgHealth).toLocaleString("fa-IR")}/۱۰۰`,
      detail: "امتیاز سلامت زیر سطح ایده‌آل است؛ اینورتر یا رشته‌ها را بررسی کن.",
    });
  }

  if (vsExpectedPct < -8) {
    factors.push({
      id: "capacity",
      title: "فاصله از ظرفیت مورد انتظار",
      severity: vsExpectedPct < -15 ? "high" : "medium",
      impactLabel: `${Math.abs(vsExpectedPct).toLocaleString("fa-IR")}٪ کمتر از انتظار`,
      detail: "نسبت به ظرفیت اسمی و بازده فصلی، تولید کمتر از حد معمول بوده است.",
    });
  }

  if (factors.length < 2) {
    factors.push({
      id: "shade",
      title: "سایه و زاویه",
      severity: "low",
      impactLabel: "بررسی دوره‌ای",
      detail: "سایه شاخه یا مانع روی رشته‌ها می‌تواند تولید صبحگاهی را کم کند.",
    });
  }

  if (factors.length < 3) {
    factors.push({
      id: "season",
      title: "اثر فصلی",
      severity: "low",
      impactLabel: "طبیعی",
      detail: "کاهش/افزایش تابش فصلی بخشی از نوسان تولید است و الزاماً ایراد فنی نیست.",
    });
  }

  const action =
    washHigh.length || washMed.length
      ? {
          title: "شستشوی پنل را در اولویت بگذار",
          description: "با ریسک آلودگی فعلی، شستشو سریع‌ترین راه نزدیک شدن به میانگین اطراف است.",
          primaryHref: "/dashboard/assistant",
          primaryLabel: "راهنمای شستشو",
          secondaryHref: "/dashboard/plant",
          secondaryLabel: "وضعیت نیروگاه",
        }
      : status === "attention"
        ? {
            title: "یک بازدید فنی پیشنهاد می‌شود",
            description: "افت نسبت به اطراف بیشتر از حد معمول است؛ دستیار یا صفحه نیروگاه را ببین.",
            primaryHref: "/dashboard/assistant",
            primaryLabel: "تحلیل با دستیار",
            secondaryHref: "/dashboard/plant",
            secondaryLabel: "نیروگاه من",
          }
        : {
            title: "عملکرد را حفظ کن",
            description: "وضعیت خوب است. گزارش ماهانه روند را برای تو نگه می‌دارد.",
            primaryHref: "/dashboard/reports",
            primaryLabel: "گزارش ماهانه",
            secondaryHref: "/dashboard/assistant",
            secondaryLabel: "دستیار انرژی",
          };

  return {
    status,
    statusLabel,
    headline,
    summary: summaryParts.join(" "),
    periodLabel,
    gaps: {
      vsNeighborPct,
      vsNationalPct,
      vsExpectedPct,
      lostKwhVsNeighbor,
      lostIncomeVsNeighbor,
    },
    highlights: {
      best: {
        label: best.label,
        production: best.production,
        note:
          bestGap >= 0
            ? `${Math.abs(bestGap).toFixed(0)}٪ بهتر از اطراف`
            : "روز/بازه اوج تولید",
      },
      worst: {
        label: worst.label,
        production: worst.production,
        note:
          worstGap < 0
            ? `${Math.abs(worstGap).toFixed(0)}٪ عقب‌تر از اطراف`
            : "کم‌بازده‌ترین بازه",
      },
    },
    factors: factors.slice(0, 3),
    action,
  };
}
