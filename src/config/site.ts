import type { NavItem } from "@/shared/types";

export const SITE_CONFIG = {
  name: "برق ما",
  tagline: "سامانه آنلاین خرید برق در ایران",
  description:
    "تامین برق با تعرفه اقتصادی و کاهش هزینه تا ۶۰ درصد، سریع، ساده و متناسب با نیاز شما",
  phone: "۰۲۱-۴۴۰۰۰۶۶۴",
  email: "info@bargheto.com",
  loginHref: "/login",
  registerHref: "/register",
  dashboardHref: "/dashboard",
} as const;

export const NAVIGATION: NavItem[] = [
  {
    label: "خدمات",
    href: "/services",
    children: [
      { label: "مشاوره انرژی", href: "/services/energy-consulting" },
      { label: "تامین برق مصرفی", href: "/services/power-supply" },
      { label: "تامین برق بدون خاموشی", href: "/services/uninterrupted-power" },
      { label: "صرفه‌جویی و بهینه‌سازی", href: "/services/optimization" },
      { label: "احداث نیروگاه تجدیدپذیر", href: "/services/renewable" },
    ],
  },
  { label: "نیروگاه خورشیدی خانگی", href: "/solar-home" },
  { label: "پاسخگوی سریع", href: "/support" },
  { label: "مجله برق ما", href: "/blog" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];
