import type { NavItem } from "@/shared/types";

export const SITE_CONFIG = {
  name: "برقینو",
  tagline: "پلتفرم فروش برق خانگی و نیروگاه خورشیدی",
  description:
    "برق تولید خانگی‌ات را فصلی بفروش: در فصل گرم قیمت بالاتر، در فصل سرد تضمین خرید با ۱۰٪ بیشتر از دولت؛ پرداخت حداکثر ۲ ماه. نیروگاه نداری؟ برات نصب می‌کنیم.",
  valueProps: {
    governmentPrice: "۵٬۰۰۰",
    barghinoPrice: "۱۵٬۰۰۰",
    priceUnit: "تومان/kWh",
    governmentPayoutMonths: "۶",
    barghinoPayoutMonths: "۲",
    /** تضمین خرید فصل سرد نسبت به نرخ دولتی */
    coldSeasonPremiumPercent: "۱۰",
  },
  cta: {
    sellPower: "فروش برق نیروگاهم",
    sellPowerHref: "/register",
    requestInstall: "درخواست نصب نیروگاه خورشیدی",
    requestInstallHref: "/solar-home",
  },
  phone: "۰۲۱-۴۴۰۰۰۶۶۴",
  email: "info@bargheto.com",
  loginHref: "/login",
  registerHref: "/register",
  dashboardHref: "/dashboard",
} as const;

export const NAVIGATION: NavItem[] = [
  { label: "فروش برق خانگی", href: "/register" },
  { label: "نصب نیروگاه خورشیدی", href: "/solar-home" },
  { label: "سوالات متداول", href: "/faq" },
  { label: "مجله برقینو", href: "/blog" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];
