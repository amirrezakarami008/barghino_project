import { MONTHLY_PRODUCTION, SOLAR_PLANTS } from "@/features/dashboard/constants";
import { SITE_CONFIG } from "@/config";
import { parsePersianNumber } from "@/shared/lib/numbers";
import {
  formatMillionToman,
  getGreenExchangeSnapshot,
  getIncomeForecast,
  getMonthlySmartReport,
} from "./insights";

export type HealthLevel = "excellent" | "good" | "watch" | "critical";

export interface PlantHealthBreakdown {
  label: string;
  score: number;
  note: string;
}

export interface PlantHealth {
  plantId: string;
  plantName: string;
  score: number;
  level: HealthLevel;
  levelLabel: string;
  washRisk: "کم" | "متوسط" | "زیاد";
  breakdown: PlantHealthBreakdown[];
  issues: string[];
}

export interface MaintenanceAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  action?: string;
  plantName?: string;
}

const HEALTH_SEED: Record<
  string,
  {
    score: number;
    inverter: number;
    panels: number;
    production: number;
    washRisk: PlantHealth["washRisk"];
    issues: string[];
  }
> = {
  sp1: {
    score: 96,
    inverter: 100,
    panels: 95,
    production: 98,
    washRisk: "متوسط",
    issues: [],
  },
  sp2: {
    score: 72,
    inverter: 78,
    panels: 70,
    production: 68,
    washRisk: "زیاد",
    issues: [
      "افت راندمان نسبت به میانگین فصلی",
      "کاهش غیرعادی تولید در ساعات اوج",
      "احتمال آلودگی سطح پنل‌ها",
      "اختلاف غیرعادی بین روزهای مشابه",
    ],
  },
};

function levelFromScore(score: number): { level: HealthLevel; levelLabel: string } {
  if (score >= 90) return { level: "excellent", levelLabel: "عالی" };
  if (score >= 80) return { level: "good", levelLabel: "خوب" };
  if (score >= 65) return { level: "watch", levelLabel: "نیاز به بررسی" };
  return { level: "critical", levelLabel: "بحرانی" };
}

export function getPlantHealth(plantId: string): PlantHealth | null {
  const plant = SOLAR_PLANTS.find((p) => p.id === plantId);
  if (!plant) return null;

  const seed = HEALTH_SEED[plantId] ?? {
    score: 88,
    inverter: 92,
    panels: 86,
    production: 90,
    washRisk: "کم" as const,
    issues: [],
  };

  const { level, levelLabel } = levelFromScore(seed.score);

  return {
    plantId: plant.id,
    plantName: plant.name,
    score: seed.score,
    level,
    levelLabel,
    washRisk: seed.washRisk,
    issues: seed.issues,
    breakdown: [
      { label: "اینورتر", score: seed.inverter, note: seed.inverter >= 90 ? "عملکرد پایدار" : "نیاز به بازبینی" },
      { label: "پنل‌ها", score: seed.panels, note: seed.washRisk === "زیاد" ? "احتمال آلودگی" : "وضعیت قابل قبول" },
      { label: "تولید", score: seed.production, note: "نسبت به ظرفیت اسمی" },
    ],
  };
}

export function getAllPlantHealth(): PlantHealth[] {
  return SOLAR_PLANTS.map((p) => getPlantHealth(p.id)).filter(Boolean) as PlantHealth[];
}

export function getMaintenanceAlerts(): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = [];
  const latest = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 1];
  const previous = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 2];
  const drop =
    previous.production > 0
      ? ((previous.production - latest.production) / previous.production) * 100
      : 0;

  if (drop >= 15) {
    alerts.push({
      id: "a-prod-drop",
      severity: "warning",
      title: "کاهش تولید نسبت به ماه قبل",
      message: `تولید ${latest.label} حدود ${drop.toFixed(0)}٪ کمتر از ${previous.label} بوده است.`,
      action: "بررسی سایه، آلودگی پنل و گزارش ماهانه",
    });
  }

  for (const health of getAllPlantHealth()) {
    if (health.washRisk === "زیاد" || health.washRisk === "متوسط") {
      alerts.push({
        id: `a-wash-${health.plantId}`,
        severity: health.washRisk === "زیاد" ? "warning" : "info",
        title: `احتمال آلودگی پنل — ${health.plantName}`,
        message: `ریسک شستشو: ${health.washRisk}. شستشو می‌تواند تا حدود ۵٪ تولید را بهتر کند.`,
        action: "زمان‌بندی شستشو طی ۷ روز آینده",
        plantName: health.plantName,
      });
    }

    if (health.score < 80) {
      alerts.push({
        id: `a-health-${health.plantId}`,
        severity: health.score < 65 ? "critical" : "warning",
        title: `سلامت نیروگاه پایین‌تر از حد مطلوب`,
        message: `${health.plantName}: امتیاز ${health.score}/100 — ${health.levelLabel}.`,
        action: "بازبینی اینورتر و رشته‌های پنل",
        plantName: health.plantName,
      });
    }

    if (health.issues.some((i) => i.includes("اینورتر") || health.breakdown[0].score < 85)) {
      if (health.breakdown[0].score < 85) {
        alerts.push({
          id: `a-inv-${health.plantId}`,
          severity: "warning",
          title: "رفتار غیرعادی اینورتر در ساعات اوج",
          message: `${health.plantName}: امتیاز اینورتر ${health.breakdown[0].score}٪ است.`,
          action: "بررسی لاگ اینورتر توسط کارشناس",
          plantName: health.plantName,
        });
      }
    }
  }

  alerts.push({
    id: "a-review",
    severity: "info",
    title: "بازبینی دوره‌ای پیشنهادی",
    message: "برای حفظ راندمان، یک بازبینی فنی طی ۷ روز آینده توصیه می‌شود.",
    action: "ثبت درخواست پشتیبانی",
  });

  return alerts;
}

/** پاسخ‌های rule-based بر اساس کلمات کلیدی — استفاده در دستیار چت */
export function answerAssistantQuestion(question: string): string {
  const q = question.trim().toLowerCase();
  const forecast = getIncomeForecast();
  const report = getMonthlySmartReport();
  const exchange = getGreenExchangeSnapshot();
  const healthList = getAllPlantHealth();
  const rate = parsePersianNumber(SITE_CONFIG.valueProps.barghinoPrice);
  const gov = parsePersianNumber(SITE_CONFIG.valueProps.governmentPrice);

  if (!q) {
    return "سؤالت را بنویس؛ مثلاً درباره تولید، درآمد، سلامت نیروگاه یا بورس سبز.";
  }

  if (/سلام|درود|hello|hi/.test(q)) {
    return "سلام! من دستیار انرژی برقینو هستم. می‌توانم درباره تولید، درآمد، مقایسه با دولت، سلامت نیروگاه و بورس سبز کمکت کنم.";
  }

  if (/سلامت|health|خراب|خرابی|راندمان/.test(q)) {
    const lines = healthList.map(
      (h) =>
        `• ${h.plantName}: ${h.score}/100 (${h.levelLabel}) — ریسک شستشو: ${h.washRisk}`,
    );
    return `وضعیت سلامت نیروگاه‌ها:\n${lines.join("\n")}\n\nاگر امتیاز زیر ۸۰ باشد، بازبینی توصیه می‌شود.`;
  }

  if (/شستشو|آلودگی|گرد و غبار|گردوغبار/.test(q)) {
    const dirty = healthList.filter((h) => h.washRisk !== "کم");
    if (!dirty.length) {
      return "الان ریسک آلودگی پنل‌ها پایین است. با این حال شستشوی فصلی معمولاً مفید است.";
    }
    return dirty
      .map(
        (h) =>
          `${h.plantName}: ریسک شستشو «${h.washRisk}». شستشو می‌تواند تا حدود ۵٪ تولید را بهتر کند.`,
      )
      .join("\n");
  }

  if (/پیش‌بینی|هفته|ماه آینده|forecast/.test(q)) {
    return (
      `پیش‌بینی تقریبی درآمد:\n` +
      `• ${forecast.nextWeek.label}: ${formatMillionToman(forecast.nextWeek.income)} تومان\n` +
      `• ${forecast.nextMonth.label}: ${formatMillionToman(forecast.nextMonth.income)} تومان\n` +
      `اطمینان حدود ${forecast.confidence}٪ است (بر اساس سابقه تولید و نرخ فعلی).`
    );
  }

  if (/دولت|مقایسه|سود بیشتر|چرا برقینو|فصل/.test(q)) {
    const latest = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 1];
    const govIncome = latest.production * gov;
    const barghinoIncome = latest.production * rate;
    const coldPremium = SITE_CONFIG.valueProps.coldSeasonPremiumPercent;
    return (
      `برای تولید ${latest.production.toLocaleString("fa-IR")} kWh در ${latest.label}:\n` +
      `• فروش به دولت: حدود ${formatMillionToman(govIncome)} تومان (نرخ اول سال ثابت تا آخر سال)\n` +
      `• فروش به برقینو: حدود ${formatMillionToman(barghinoIncome)} تومان\n` +
      `• سود بیشتر نمونه: حدود ${formatMillionToman(barghinoIncome - govIncome)} تومان\n\n` +
      `مزیت فصلی برقینو:\n` +
      `• فصل گرم (تولید بیشتر): خرید با قیمت بالاتر از مسیر دولتی\n` +
      `• فصل سرد (تولید کمتر): تضمین خرید با ${coldPremium}٪ بیشتر از نرخ دولتی`
    );
  }

  if (/بورس|نرخ|قیمت/.test(q)) {
    return (
      `نرخ نمونه بورس سبز الان ${exchange.currentRate.toLocaleString("fa-IR")} تومان/kWh است ` +
      `(${exchange.direction === "up" ? "↑" : "↓"} ${Math.abs(exchange.changePercent)}٪).\n` +
      `${exchange.personalImpact.message}`
    );
  }

  if (/درآمد|پول|پرداخت|صورت.?حساب/.test(q)) {
    return (
      `درآمد ${report.period}: حدود ${formatMillionToman(report.income)} تومان ` +
      `(${report.productionKwh.toLocaleString("fa-IR")} kWh).\n` +
      `رشد نسبت به ماه قبل: ${report.growthPercent}٪.\n` +
      `پرداخت برقینو حداکثر ${SITE_CONFIG.valueProps.barghinoPayoutMonths} ماه است.`
    );
  }

  if (/تولید|kwh|کیلووات/.test(q)) {
    return (
      `تولید ${report.period}: ${report.productionKwh.toLocaleString("fa-IR")} kWh.\n` +
      `بهترین روز تقریبی: ${report.bestDay.date} (${report.bestDay.productionKwh} kWh).\n` +
      `ضعیف‌ترین روز: ${report.worstDay.date} — ${report.worstDay.note}`
    );
  }

  if (/هشدار|نگهداری|بازدید|سرویس/.test(q)) {
    const alerts = getMaintenanceAlerts().slice(0, 3);
    return (
      "مهم‌ترین هشدارهای فعلی:\n" +
      alerts.map((a) => `• ${a.title}: ${a.message}`).join("\n")
    );
  }

  if (/نصب|پشت.?بام|ماشین حساب/.test(q)) {
    return "اگر هنوز نیروگاه نداری، از صفحه نصب یا ماشین حساب `/solar-home` ظرفیت و درآمد تقریبی را ببین، بعد درخواست نصب بده.";
  }

  return (
    "هنوز دقیقاً منظورت را نگرفتم. می‌توانی بپرسی:\n" +
    "• سلامت نیروگاهم چطوره؟\n" +
    "• درآمد ماه آینده چقدر می‌شود؟\n" +
    "• اگر به دولت می‌فروختم چقدر می‌گرفتم؟\n" +
    "• نرخ بورس سبز چقدر است؟\n" +
    "• نیاز به شستشو دارم؟"
  );
}
