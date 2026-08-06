import type { ServiceDetail } from "@/shared/types";
import { SITE_CONFIG } from "@/config";

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "sell-home-power": {
    id: "sell",
    slug: "sell-home-power",
    title: "فروش برق خانگی",
    subtitle: "برق تولیدی‌ات را به قیمت بورس سبز بفروش",
    description: "برق تولیدی نیروگاه خانگی را با نرخ بورس سبز به برقینو بفروشید",
    href: "/services/sell-home-power",
    icon: "Zap",
    gradient: "from-emerald-500 to-teal-400",
    variant: "renewable",
    heroLabel: "برای مالکان نیروگاه خورشیدی خانگی",
    overview:
      "اگر روی پشت‌بام یا ملک خود نیروگاه خورشیدی دارید، برقینو برق تولیدی شما را می‌خرد: در فصل‌های گرم با نرخ بالاتر مبتنی بر بورس سبز، و در فصل‌های سرد با تضمین خرید حداقل ۱۰٪ بالاتر از نرخ دولتی. تعرفه دولتی معمولاً اول سال قفل می‌شود و تا آخر سال ثابت می‌ماند؛ پرداخت برقینو هم حداکثر ظرف ۲ ماه است.",
    heroStats: [
      {
        id: "hs1",
        value: SITE_CONFIG.valueProps.barghinoPrice,
        label: "نرخ نمونه برقینو",
        note: SITE_CONFIG.valueProps.priceUnit,
      },
      {
        id: "hs2",
        value: SITE_CONFIG.valueProps.barghinoPayoutMonths,
        suffix: " ماه",
        label: "حداکثر زمان پرداخت",
        note: "تضمینی",
      },
      {
        id: "hs3",
        value: `+${SITE_CONFIG.valueProps.coldSeasonPremiumPercent}٪`,
        label: "کف تضمینی فصل سرد",
        note: "نسبت به نرخ دولتی",
      },
    ],
    highlightPoints: [
      "در فصل گرم خرید با قیمت بالاتر؛ وقتی تولید هم بیشتر است",
      `در فصل سرد تضمین خرید با ${SITE_CONFIG.valueProps.coldSeasonPremiumPercent}٪ بیشتر از نرخ دولتی`,
      "نرخ دولتی اول سال ثابت می‌شود؛ مسیر برقینو فصلی و منعطف است",
      "پرداخت تضمینی حداکثر ۲ ماه",
    ],
    trustPoints: ["تضمین فصل سرد", "نرخ بورس سبز", "پرداخت سریع"],
    benefits: [
      {
        id: "b1",
        title: "قیمت بالاتر در فصل گرم",
        description:
          "وقتی تولید نیروگاه بیشتر است، خرید بر اساس بورس سبز — معمولاً بالاتر از تعرفه ثابت دولتی",
        icon: "TrendingDown",
      },
      {
        id: "b2",
        title: "کف تضمینی در فصل سرد",
        description: `حتی با تولید کمتر، تضمین خرید با ${SITE_CONFIG.valueProps.coldSeasonPremiumPercent}٪ بیشتر از نرخ دولتی`,
        icon: "ShieldCheck",
      },
      {
        id: "b3",
        title: "پرداخت سریع‌تر",
        description: "حداکثر ۲ ماه، نه انتظار تا ۶ ماه مسیر دولتی",
        icon: "Zap",
      },
      {
        id: "b4",
        title: "پنل شفاف",
        description: "تولید، صورت‌حساب و پرداخت‌ها در داشبورد خانگی",
        icon: "LayoutDashboard",
      },
    ],
    process: [
      { id: "p1", step: 1, title: "ثبت‌نام", description: "حساب خانگی بسازید" },
      { id: "p2", step: 2, title: "معرفی نیروگاه", description: "انشعاب و مشخصات نیروگاه را ثبت کنید" },
      { id: "p3", step: 3, title: "عقد قرارداد", description: "قرارداد فروش برق را امضا کنید" },
      { id: "p4", step: 4, title: "دریافت درآمد", description: "صورت‌حساب ماهانه و واریز حداکثر ۲ ماهه" },
    ],
    faq: [
      {
        id: "f1",
        question: "آیا می‌توانم همزمان به دولت هم بفروشم؟",
        answer: "مسیر فروش به دولت و برقینو متفاوت است؛ تیم پشتیبانی برای انتخاب مسیر مناسب راهنمایی می‌کند.",
      },
      {
        id: "f2",
        question: "نرخ دقیقاً چقدر است؟",
        answer: `نرخ در فصل گرم بر اساس بورس سبز اعلام می‌شود؛ در فصل سرد تضمین خرید با ${SITE_CONFIG.valueProps.coldSeasonPremiumPercent}٪ بیشتر از نرخ دولتی برقرار است. اعداد نمونه در سایت برای مقایسه هستند.`,
      },
      {
        id: "f3",
        question: "تفاوت قیمت‌گذاری دولت و برقینو چیست؟",
        answer:
          "قیمت خرید دولت معمولاً اول سال تعیین و تا پایان سال ثابت می‌ماند. برقینو در فصل‌های گرم گران‌تر می‌خرد و در فصل‌های سرد کف قیمت تضمینی دارد.",
      },
    ],
    relatedCta: {
      badge: "شروع فروش",
      title: "آماده فروش برق خانگی‌ات هستی؟",
      description: "ثبت‌نام کن و نیروگاه‌ات را به مسیر فروش برقینو وصل کن.",
      primaryLabel: SITE_CONFIG.cta.sellPower,
      primaryHref: SITE_CONFIG.cta.sellPowerHref,
      secondaryLabel: "سوالات متداول",
      secondaryHref: "/faq",
    },
  },

  "solar-home-install": {
    id: "install",
    slug: "solar-home-install",
    title: "نصب نیروگاه خورشیدی",
    subtitle: "نداری؟ برات نصب می‌کنیم",
    description: "اگر نیروگاه ندارید، درخواست احداث بدهید و بعد وارد مسیر فروش شوید",
    href: "/services/solar-home-install",
    icon: "Sun",
    gradient: "from-amber-500 to-orange-400",
    variant: "renewable",
    heroLabel: "برای مشترکان خانگی بدون نیروگاه",
    overview:
      "اگر هنوز نیروگاه خورشیدی ندارید، از طریق برقینو درخواست نصب می‌دهید. پس از بازدید، پیشنهاد، قرارداد و احداث، وارد مسیر فروش برق به برقینو می‌شوید.",
    heroStats: [
      { id: "hs1", value: "۷", label: "مرحله شفاف تا بهره‌برداری", note: "از درخواست تا تحویل" },
      { id: "hs2", value: "۲۴", suffix: "س", label: "پاسخ اولیه به درخواست", note: "معمولاً" },
      { id: "hs3", value: "۱", label: "هدف نهایی: فروش برق", note: "پس از راه‌اندازی" },
    ],
    highlightPoints: [
      "بازدید کارشناس و پیشنهاد شفاف",
      "نصب و اتصال به شبکه",
      "پس از بهره‌برداری، فروش با نرخ بورس سبز",
    ],
    trustPoints: ["مسیر شفاف", "همراهی تا راه‌اندازی", "اتصال به فروش"],
    benefits: [
      {
        id: "b1",
        title: "از صفر تا فروش",
        description: "نصب فقط شروع است؛ بعد وارد درآمد فروش برق می‌شوید",
        icon: "Sun",
      },
      {
        id: "b2",
        title: "پیگیری در پنل",
        description: "وضعیت درخواست نصب را مرحله‌به‌مرحله ببینید",
        icon: "ShieldCheck",
      },
      {
        id: "b3",
        title: "تمرکز خانگی",
        description: "طراحی برای پشت‌بام و ملک مسکونی",
        icon: "Zap",
      },
      {
        id: "b4",
        title: "پشتیبانی مدارک",
        description: "راهنمایی قرارداد و مدارک لازم",
        icon: "Headphones",
      },
    ],
    process: [
      { id: "p1", step: 1, title: "ثبت درخواست", description: "آدرس و مشخصات ملک" },
      { id: "p2", step: 2, title: "بازدید و پیشنهاد", description: "ارزیابی پشت‌بام و قیمت" },
      { id: "p3", step: 3, title: "قرارداد و نصب", description: "امضا، نصب، اتصال به شبکه" },
      { id: "p4", step: 4, title: "فروش برق", description: "شروع درآمد با نرخ بورس سبز" },
    ],
    faq: [
      {
        id: "f1",
        question: "چقدر طول می‌کشد؟",
        answer: "بسته به ملک و مجوزها معمولاً چند هفته؛ وضعیت را در پنل پیگیری می‌کنید.",
      },
      {
        id: "f2",
        question: "بعد از نصب چه می‌شود؟",
        answer: "نیروگاه فعال می‌شود و می‌توانید برق را به برقینو بفروشید.",
      },
    ],
    relatedCta: {
      badge: "درخواست نصب",
      title: "می‌خواهی نیروگاه خانگی داشته باشی؟",
      description: "درخواست بده تا مسیر بازدید و نصب شروع شود.",
      primaryLabel: SITE_CONFIG.cta.requestInstall,
      primaryHref: SITE_CONFIG.cta.requestInstallHref,
      secondaryLabel: "فروش برق دارم",
      secondaryHref: SITE_CONFIG.cta.sellPowerHref,
    },
  },

  "support-path": {
    id: "support",
    slug: "support-path",
    title: "پشتیبانی و پیگیری",
    subtitle: "همراهی از مدارک تا پرداخت",
    description: "راهنمایی مدارک، قرارداد و وضعیت پرداخت",
    href: "/services/support-path",
    icon: "Headphones",
    gradient: "from-slate-600 to-slate-800",
    variant: "advisory",
    heroLabel: "برای سوال درباره قرارداد، مدارک و درآمد",
    overview:
      "تیم پشتیبانی برقینو در مسیر فروش برق خانگی و درخواست نصب همراه شماست: مدارک، قرارداد، صورت‌حساب و وضعیت پرداخت.",
    highlightPoints: [
      "راهنمایی مدارک و قرارداد",
      "پیگیری وضعیت پرداخت",
      "پاسخ به سوالات مسیر فروش و نصب",
    ],
    trustPoints: ["پاسخ شفاف", "پیگیری وضعیت", "تمرکز خانگی"],
    benefits: [
      {
        id: "b1",
        title: "تیکت پشتیبانی",
        description: "از پنل درخواست پشتیبانی ثبت کنید",
        icon: "Headphones",
      },
      {
        id: "b2",
        title: "اعلان‌ها",
        description: "صورت‌حساب و وضعیت قرارداد را در اعلان‌ها ببینید",
        icon: "Zap",
      },
      {
        id: "b3",
        title: "FAQ",
        description: "پاسخ‌های پرتکرار درباره قیمت و پرداخت",
        icon: "ShieldCheck",
      },
      {
        id: "b4",
        title: "تماس",
        description: "از صفحه تماس با ما هم در دسترسید",
        icon: "Phone",
      },
    ],
    process: [
      { id: "p1", step: 1, title: "سوال را مطرح کنید", description: "تیکت یا تماس" },
      { id: "p2", step: 2, title: "بررسی کارشناس", description: "پاسخ در کوتاه‌ترین زمان" },
      { id: "p3", step: 3, title: "پیگیری در پنل", description: "وضعیت تیکت و اعلان‌ها" },
    ],
    faq: [
      {
        id: "f1",
        question: "چطور تیکت بزنم؟",
        answer: "پس از ورود، از بخش پشتیبانی داشبورد تیکت جدید بسازید.",
      },
    ],
    relatedCta: {
      badge: "پشتیبانی",
      title: "سوالی داری؟",
      description: "از پشتیبانی پنل یا صفحه تماس پیام بگذار.",
      primaryLabel: "رفتن به پشتیبانی",
      primaryHref: "/support",
      secondaryLabel: "تماس با ما",
      secondaryHref: "/contact",
    },
  },
};

export function getServiceDetail(slug: string) {
  return SERVICE_DETAILS[slug];
}
