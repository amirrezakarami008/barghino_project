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

export type MaintenanceAlertCategory =
  | "wash"
  | "inverter"
  | "panel"
  | "mounting"
  | "cabling"
  | "protection"
  | "production"
  | "review";

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
  category: MaintenanceAlertCategory;
  title: string;
  message: string;
  action?: string;
  plantName?: string;
  plantId?: string;
  /** برآورد اثر روی تولید (درصد) */
  impactPercent?: number;
  href?: string;
  date?: string;
}

const HEALTH_SEED: Record<
  string,
  {
    score: number;
    inverter: number;
    panels: number;
    production: number;
    mounting: number;
    cabling: number;
    protection: number;
    washRisk: PlantHealth["washRisk"];
    issues: string[];
  }
> = {
  sp1: {
    score: 96,
    inverter: 100,
    panels: 95,
    production: 98,
    mounting: 97,
    cabling: 94,
    protection: 96,
    washRisk: "متوسط",
    issues: [],
  },
  sp2: {
    score: 72,
    inverter: 78,
    panels: 70,
    production: 68,
    mounting: 82,
    cabling: 74,
    protection: 80,
    washRisk: "زیاد",
    issues: [
      "افت راندمان نسبت به میانگین فصلی",
      "کاهش غیرعادی تولید در ساعات اوج",
      "احتمال آلودگی سطح پنل‌ها",
      "اختلاف غیرعادی بین روزهای مشابه",
      "گرم شدن غیرعادی کانکتورهای DC",
    ],
  },
};

function levelFromScore(score: number): { level: HealthLevel; levelLabel: string } {
  if (score >= 90) return { level: "excellent", levelLabel: "عالی" };
  if (score >= 80) return { level: "good", levelLabel: "خوب" };
  if (score >= 65) return { level: "watch", levelLabel: "نیاز به بررسی" };
  return { level: "critical", levelLabel: "بحرانی" };
}

function todayLabel() {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return "امروز";
  }
}

export function getPlantHealth(plantId: string): PlantHealth | null {
  const plant = SOLAR_PLANTS.find((p) => p.id === plantId);
  if (!plant) return null;

  const seed = HEALTH_SEED[plantId] ?? {
    score: 88,
    inverter: 92,
    panels: 86,
    production: 90,
    mounting: 90,
    cabling: 88,
    protection: 91,
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
      {
        label: "اینورتر",
        score: seed.inverter,
        note: seed.inverter >= 90 ? "عملکرد پایدار" : "نیاز به بازبینی",
      },
      {
        label: "پنل‌ها",
        score: seed.panels,
        note: seed.washRisk === "زیاد" ? "احتمال آلودگی" : "وضعیت قابل قبول",
      },
      {
        label: "سازه",
        score: seed.mounting,
        note: seed.mounting >= 85 ? "اتصالات محکم" : "بازبینی پیچ و ریل",
      },
      {
        label: "کابل‌کشی",
        score: seed.cabling,
        note: seed.cabling >= 85 ? "مسیر ایمن" : "احتمال اتصال ضعیف",
      },
      {
        label: "حفاظت",
        score: seed.protection,
        note: seed.protection >= 85 ? "SPD و فیوز سالم" : "بررسی تابلو حفاظت",
      },
      { label: "تولید", score: seed.production, note: "نسبت به ظرفیت اسمی" },
    ],
  };
}

export function getAllPlantHealth(): PlantHealth[] {
  return SOLAR_PLANTS.map((p) => getPlantHealth(p.id)).filter(Boolean) as PlantHealth[];
}

export function getMaintenanceAlerts(): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = [];
  const date = todayLabel();
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
      category: "production",
      title: "کاهش تولید نسبت به ماه قبل",
      message: `تولید ${latest.label} حدود ${drop.toFixed(0)}٪ کمتر از ${previous.label} بوده است.`,
      action: "بررسی سایه، آلودگی پنل و گزارش ماهانه",
      impactPercent: Math.round(drop),
      href: "/dashboard/production",
      date,
    });
  }

  for (const health of getAllPlantHealth()) {
    const byLabel = (label: string) =>
      health.breakdown.find((b) => b.label === label)?.score ?? 100;

    // آلودگی پنل
    if (health.washRisk === "زیاد" || health.washRisk === "متوسط") {
      const impact = health.washRisk === "زیاد" ? 5 : 3;
      alerts.push({
        id: `a-wash-${health.plantId}`,
        severity: health.washRisk === "زیاد" ? "critical" : "warning",
        category: "wash",
        title: `آلودگی پنل‌ها — ${health.plantName}`,
        message: `ریسک کثیفی: ${health.washRisk}. شستشو می‌تواند تا حدود ${impact}٪ تولید را برگرداند.`,
        action: "زمان‌بندی شستشو طی ۷ روز آینده",
        plantName: health.plantName,
        plantId: health.plantId,
        impactPercent: impact,
        href: "/dashboard/plant",
        date,
      });
    }

    // پنل‌ها (راندمان جدا از آلودگی)
    const panelScore = byLabel("پنل‌ها");
    if (panelScore < 75) {
      alerts.push({
        id: `a-panel-${health.plantId}`,
        severity: panelScore < 65 ? "critical" : "warning",
        category: "panel",
        title: `افت عملکرد رشته پنل — ${health.plantName}`,
        message: `امتیاز پنل‌ها ${panelScore}٪ است. احتمال سایه موضعی، ماژول معیوب یا اتصال ضعیف وجود دارد.`,
        action: "بازدید رشته‌ها و بررسی هات‌اسپات",
        plantName: health.plantName,
        plantId: health.plantId,
        impactPercent: Math.max(2, 100 - panelScore),
        href: "/dashboard/plant",
        date,
      });
    }

    // اینورتر
    const invScore = byLabel("اینورتر");
    if (invScore < 85) {
      alerts.push({
        id: `a-inv-${health.plantId}`,
        severity: invScore < 70 ? "critical" : "warning",
        category: "inverter",
        title: `هشدار اینورتر — ${health.plantName}`,
        message: `امتیاز اینورتر ${invScore}٪ است؛ رفتار غیرعادی در ساعات اوج گزارش شده.`,
        action: "بررسی لاگ خطا و دمای اینورتر",
        plantName: health.plantName,
        plantId: health.plantId,
        impactPercent: Math.max(3, 100 - invScore),
        href: "/dashboard/support",
        date,
      });
    }

    // سازه
    const mountScore = byLabel("سازه");
    if (mountScore < 85) {
      alerts.push({
        id: `a-mount-${health.plantId}`,
        severity: mountScore < 70 ? "warning" : "info",
        category: "mounting",
        title: `بازبینی سازه نصب — ${health.plantName}`,
        message: `امتیاز سازه ${mountScore}٪ است. پیچ‌ها، ریل و تکیه‌گاه را از نظر شل‌شدگی و خوردگی چک کنید.`,
        action: "بازدید چشمی سازه پس از باد شدید",
        plantName: health.plantName,
        plantId: health.plantId,
        href: "/dashboard/plant",
        date,
      });
    }

    // کابل و اتصالات
    const cableScore = byLabel("کابل‌کشی");
    if (cableScore < 85 || health.issues.some((i) => i.includes("کانکتور"))) {
      alerts.push({
        id: `a-cable-${health.plantId}`,
        severity: cableScore < 75 ? "warning" : "info",
        category: "cabling",
        title: `اتصالات DC/AC — ${health.plantName}`,
        message:
          cableScore < 85
            ? `امتیاز کابل‌کشی ${cableScore}٪ است؛ احتمال گرم‌شدن کانکتور یا افت ولتاژ وجود دارد.`
            : "نشانه‌هایی از گرم شدن کانکتورهای DC گزارش شده است.",
        action: "ترموگرافی کانکتورها و سفت‌کردن اتصالات",
        plantName: health.plantName,
        plantId: health.plantId,
        impactPercent: cableScore < 85 ? Math.max(2, 90 - cableScore) : 2,
        href: "/dashboard/support",
        date,
      });
    }

    // حفاظت
    const protScore = byLabel("حفاظت");
    if (protScore < 85) {
      alerts.push({
        id: `a-prot-${health.plantId}`,
        severity: protScore < 70 ? "critical" : "warning",
        category: "protection",
        title: `تابلو و حفاظت — ${health.plantName}`,
        message: `امتیاز حفاظت ${protScore}٪ است. وضعیت SPD، فیوز و قطع‌کننده‌ها را بررسی کنید.`,
        action: "بازدید تابلو AC/DC توسط کارشناس",
        plantName: health.plantName,
        plantId: health.plantId,
        href: "/dashboard/support",
        date,
      });
    }

    if (health.score < 80) {
      alerts.push({
        id: `a-health-${health.plantId}`,
        severity: health.score < 65 ? "critical" : "warning",
        category: "review",
        title: "سلامت کلی نیروگاه پایین‌تر از حد مطلوب",
        message: `${health.plantName}: امتیاز ${health.score}/100 — ${health.levelLabel}.`,
        action: "بازبینی اینورتر، پنل و کابل‌کشی",
        plantName: health.plantName,
        plantId: health.plantId,
        href: "/dashboard/assistant",
        date,
      });
    }
  }

  alerts.push({
    id: "a-review",
    severity: "info",
    category: "review",
    title: "بازبینی دوره‌ای پیشنهادی",
    message: "برای حفظ راندمان، یک بازبینی فنی تجهیزات طی ۷ روز آینده توصیه می‌شود.",
    action: "ثبت درخواست پشتیبانی",
    href: "/dashboard/support",
    date,
  });

  return alerts;
}

/** آلارم‌های عملیاتی برای مرکز اعلان‌ها */
export function getEquipmentAlertNotifications(): Array<{
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "warning" | "info";
  href?: string;
}> {
  return getMaintenanceAlerts()
    .filter((a) => a.severity === "warning" || a.severity === "critical")
    .map((a) => ({
      id: `notif-${a.id}`,
      title: a.title,
      message: a.message,
      date: a.date ?? todayLabel(),
      read: false,
      type: a.severity === "critical" ? ("warning" as const) : ("warning" as const),
      href: a.href,
    }));
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
    return "سلام! من دستیار انرژی برقینو هستم. می‌توانم درباره تولید، درآمد، مقایسه با قرارداد رسمیی، سلامت نیروگاه و بورس سبز کمکت کنم.";
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
      `• فروش پایه: حدود ${formatMillionToman(govIncome)} تومان (نرخ اول سال ثابت تا آخر سال)\n` +
      `• فروش به برقینو: حدود ${formatMillionToman(barghinoIncome)} تومان\n` +
      `• سود بیشتر نمونه: حدود ${formatMillionToman(barghinoIncome - govIncome)} تومان\n\n` +
      `مزیت فصلی برقینو:\n` +
      `• فصل گرم (تولید بیشتر): خرید با قیمت بالاتر از مسیر پایه\n` +
      `• فصل سرد (تولید کمتر): خرید با قرارداد رسمی و ${coldPremium}٪ بیشتر از نرخ پایه`
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

  if (/هشدار|نگهداری|بازدید|سرویس|آلارم|کثیف|تجهیز/.test(q)) {
    const alerts = getMaintenanceAlerts().slice(0, 4);
    return (
      "مهم‌ترین آلارم‌های تجهیزات:\n" +
      alerts.map((a) => `• [${a.category}] ${a.title}: ${a.message}`).join("\n") +
      "\n\nجزئیات بیشتر در `/dashboard/alarms`."
    );
  }

  if (/نصب|پشت.?بام|ماشین حساب/.test(q)) {
    return "اگر هنوز نیروگاه نداری، از صفحه نصب یا ماشین حساب `/solar-home` ظرفیت و درآمد تقریبی را ببین، بعد درخواست نصب بده.";
  }

  return (
    "هنوز دقیقاً منظورت را نگرفتم. می‌توانی بپرسی:\n" +
    "• سلامت نیروگاهم چطوره؟\n" +
    "• درآمد ماه آینده چقدر می‌شود؟\n" +
    "• اگر با نرخ پایه می‌فروختم چقدر می‌گرفتم؟\n" +
    "• نرخ بورس سبز چقدر است؟\n" +
    "• نیاز به شستشو دارم؟"
  );
}
