import { SITE_CONFIG } from "@/config";
import { MONTHLY_PRODUCTION } from "@/features/dashboard/constants";
import { parsePersianNumber } from "@/shared/lib/numbers";

const rate = () => parsePersianNumber(SITE_CONFIG.valueProps.barghinoPrice);
const govRate = () => parsePersianNumber(SITE_CONFIG.valueProps.governmentPrice);

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** پیش‌بینی ساده بر اساس میانگین ماه‌های اخیر + ضریب فصلی */
export function getIncomeForecast() {
  const productions = MONTHLY_PRODUCTION.map((p) => p.production);
  const avgProd = avg(productions);

  // ضریب تقریبی فصل پاییز نسبت به میانگین تابستان
  const nextWeekProd = Math.round(avgProd / 4 * 0.92);
  const nextMonthProd = Math.round(avgProd * 0.88);
  const nextWeekIncome = nextWeekProd * rate();
  const nextMonthIncome = nextMonthProd * rate();

  const rateUpScenario = Math.round(nextMonthIncome * 1.08);
  const confidence = 78;

  return {
    nextWeek: {
      productionKwh: nextWeekProd,
      income: nextWeekIncome,
      label: "هفته آینده",
    },
    nextMonth: {
      productionKwh: nextMonthProd,
      income: nextMonthIncome,
      label: "ماه آینده",
    },
    rateUpScenario: {
      income: rateUpScenario,
      extra: rateUpScenario - nextMonthIncome,
      rateChangePercent: 8,
    },
    confidence,
    assumptions: [
      "میانگین تولید ۶ ماه اخیر",
      "ضریب فصلی پاییز (کاهش تابش)",
      `نرخ فعلی بورس سبز: ${SITE_CONFIG.valueProps.barghinoPrice} تومان/kWh`,
    ],
  };
}

/** گزارش هوشمند ماه آخر */
export function getMonthlySmartReport() {
  const latest = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 1];
  const previous = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 2];
  const growth =
    previous.production > 0
      ? ((latest.production - previous.production) / previous.production) * 100
      : 0;

  const bestDay = { date: "۱۲ شهریور", productionKwh: 32, note: "آسمان صاف و دمای مناسب" };
  const worstDay = {
    date: "۲۵ شهریور",
    productionKwh: 14,
    note: "گردوغبار و کاهش تابش",
  };

  return {
    period: `${latest.label} ۱۴۰۴`,
    productionKwh: latest.production,
    income: latest.earnings,
    growthPercent: Number(growth.toFixed(1)),
    bestDay,
    worstDay,
    insights: [
      growth < 0
        ? `تولید نسبت به ${previous.label} ${Math.abs(Number(growth.toFixed(1)))}٪ کاهش داشته است.`
        : `تولید نسبت به ${previous.label} ${Math.abs(Number(growth.toFixed(1)))}٪ افزایش داشته است.`,
      `درآمد این ماه با نرخ بورس سبز حدود ${(latest.earnings / 1_000_000).toFixed(1)} میلیون تومان بوده است.`,
      `اگر همین تولید را به دولت می‌فروختید حدود ${((latest.production * govRate()) / 1_000_000).toFixed(1)} میلیون تومان می‌گرفتید.`,
    ],
    recommendations: [
      {
        title: "شستشوی پنل‌ها در هفته آینده",
        impact: "افزایش تقریبی درآمد تا ۵٪",
      },
      {
        title: "بازبینی سایه احتمالی روی رشته شرقی",
        impact: "جلوگیری از افت تولید در ساعات صبح",
      },
    ],
  };
}

/** داده نمونه مرکز بورس سبز */
export function getGreenExchangeSnapshot() {
  const current = parsePersianNumber(SITE_CONFIG.valueProps.barghinoPrice);
  const previous = 14_600;
  const changePercent = Number((((current - previous) / previous) * 100).toFixed(1));
  const latest = MONTHLY_PRODUCTION[MONTHLY_PRODUCTION.length - 1];
  const incomeImpactPercent = 6;

  return {
    currentRate: current,
    previousRate: previous,
    changePercent,
    direction: changePercent >= 0 ? ("up" as const) : ("down" as const),
    updatedAt: "امروز · نمونه",
    drivers: [
      { label: "افزایش تقاضا", detail: "خریداران بزرگ در بورس سبز فعال‌تر شده‌اند." },
      { label: "کاهش عرضه مقطعی", detail: "تولید برخی نیروگاه‌ها به‌خاطر گردوغبار کمتر شده." },
      { label: "گرمای هوا", detail: "مصرف شبکه بالا رفته و قیمت سبز حمایت شده." },
    ],
    personalImpact: {
      percent: incomeImpactPercent,
      message: `این تغییر نرخ، درآمد ماه ${latest.label} شما را حدود ${incomeImpactPercent}٪ تحت تأثیر قرار داده است.`,
      amount: Math.round(latest.earnings * (incomeImpactPercent / 100)),
    },
    history: [
      { label: "فروردین", rate: 14_200 },
      { label: "اردیبهشت", rate: 14_400 },
      { label: "خرداد", rate: 14_800 },
      { label: "تیر", rate: 15_100 },
      { label: "مرداد", rate: 14_900 },
      { label: "شهریور", rate: current },
    ],
    faq: [
      {
        q: "بورس سبز چیست؟",
        a: "بازاری برای معامله برق تجدیدپذیر است که قیمت آن معمولاً از تعرفه پایه دولتی بالاتر است.",
      },
      {
        q: "چرا نرخ عوض می‌شود؟",
        a: "برخلاف نرخ دولتی که اول سال تعیین و تا آخر سال ثابت می‌ماند، نرخ برقینو فصلی است: در فصل گرم بالاتر، و در فصل سرد با کف تضمینی بالاتر از نرخ دولتی.",
      },
      {
        q: "روی درآمد من چه اثری دارد؟",
        a: `در ماه‌های پربازده با نرخ بالاتر می‌خریم؛ در ماه‌های کم‌بازده هم تضمین خرید با ${SITE_CONFIG.valueProps.coldSeasonPremiumPercent}٪ بیشتر از نرخ دولتی برقرار است.`,
      },
    ],
  };
}

export function formatMillionToman(n: number) {
  return `${(n / 1_000_000).toFixed(1)} میلیون`;
}
