import type { DashboardNavItem, DashboardUser } from "@/types/dashboard";
import { IMAGES } from "../images";

export const DASHBOARD_USER: DashboardUser = {
  id: "u-1001",
  name: "علی زمانی",
  phone: "۰۹۱۲۳۴۵۶۷۸۹",
  email: "ali.zamani@example.com",
  nationalId: "۰۰۱۲۳۴۵۶۷۸",
  company: "فولاد آریا",
  role: "business",
  avatar: IMAGES.testimonials[0],
  memberSince: "۱۴۰۳/۰۶/۱۵",
  verified: true,
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "داشبورد", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "شناسه‌های قبض", href: "/dashboard/bills", icon: "FileText" },
  { label: "مصرف و تحلیل", href: "/dashboard/consumption", icon: "BarChart3" },
  { label: "قراردادها", href: "/dashboard/contracts", icon: "FileCheck" },
  { label: "خرید برق", href: "/dashboard/buy", icon: "ShoppingCart" },
  { label: "فاکتورها", href: "/dashboard/invoices", icon: "Receipt", badge: 2 },
  { label: "پرداخت‌ها", href: "/dashboard/payments", icon: "CreditCard" },
  { label: "اعلان‌ها", href: "/dashboard/notifications", icon: "Bell", badge: 5 },
  { label: "پشتیبانی", href: "/dashboard/support", icon: "Headphones" },
  { label: "اسناد", href: "/dashboard/documents", icon: "FolderOpen" },
  { label: "پروفایل", href: "/dashboard/profile", icon: "User" },
  { label: "تنظیمات", href: "/dashboard/settings", icon: "Settings" },
];

export const DASHBOARD_STATS = [
  {
    id: "usage",
    label: "مصرف ماه جاری",
    value: "۱۲,۴۵۰",
    suffix: "kWh",
    change: "↓ ۸٪ نسبت به ماه قبل",
    trend: "down" as const,
    icon: "BarChart3" as const,
    color: "blue" as const,
  },
  {
    id: "cost",
    label: "هزینه تخمینی",
    value: "۲۹.۱",
    suffix: "میلیون تومان",
    change: "↓ ۳۲٪ صرفه‌جویی",
    trend: "down" as const,
    icon: "Receipt" as const,
    color: "green" as const,
  },
  {
    id: "contracts",
    label: "قرارداد فعال",
    value: "۲",
    suffix: "قرارداد",
    change: "۱ قرارداد تا پایان ۳ ماه",
    trend: "neutral" as const,
    icon: "FileCheck" as const,
    color: "violet" as const,
  },
  {
    id: "savings",
    label: "صرفه‌جویی سالانه",
    value: "۱۸۶",
    suffix: "میلیون تومان",
    change: "↑ ۱۲٪ نسبت به سال قبل",
    trend: "up" as const,
    icon: "ShoppingCart" as const,
    color: "amber" as const,
  },
];

export const QUICK_ACTIONS = [
  {
    label: "خرید برق",
    href: "/dashboard/buy",
    icon: "ShoppingCart" as const,
    description: "انتخاب پکیج و عقد قرارداد",
  },
  {
    label: "افزودن شناسه قبض",
    href: "/dashboard/bills",
    icon: "FileText" as const,
    description: "ثبت واحد جدید",
  },
  {
    label: "پرداخت فاکتور",
    href: "/dashboard/invoices",
    icon: "CreditCard" as const,
    description: "۲ فاکتور معوق",
  },
  {
    label: "ثبت تیکت",
    href: "/dashboard/support",
    icon: "Headphones" as const,
    description: "پشتیبانی فوری",
  },
];
