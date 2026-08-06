import type { DashboardNavItem, DashboardUser } from "@/shared/types/dashboard";
import { IMAGES } from "@/shared/constants/images";

export const DASHBOARD_USER: DashboardUser = {
  id: "u-1001",
  name: "مهدی رضایی",
  phone: "۰۹۱۲۳۴۵۶۷۸۹",
  email: "mahdi.rezaei@example.com",
  nationalId: "۰۰۱۲۳۴۵۶۷۸",
  role: "personal",
  isAdmin: true,
  avatar: IMAGES.testimonials[0],
  memberSince: "۱۴۰۳/۰۶/۱۵",
  verified: true,
};

/** ترتیب و برچسب‌ها مطابق موکاپ پنل */
export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "داشبورد", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "نیروگاه من", href: "/dashboard/plant", icon: "Sun" },
  { label: "تولید و درآمد", href: "/dashboard/production", icon: "BarChart3" },
  { label: "صورت‌حساب‌ها", href: "/dashboard/invoices", icon: "Receipt" },
  { label: "پرداخت‌ها", href: "/dashboard/payments", icon: "CreditCard" },
  { label: "قراردادها", href: "/dashboard/contracts", icon: "FileCheck" },
  { label: "درخواست نصب", href: "/dashboard/install", icon: "ClipboardList" },
  { label: "اعلان‌ها", href: "/dashboard/notifications", icon: "Bell", badge: 3 },
  { label: "پشتیبانی", href: "/dashboard/support", icon: "Headphones", badge: 2 },
  { label: "مدارک", href: "/dashboard/documents", icon: "FolderOpen" },
  { label: "مدیریت حساب", href: "/dashboard/profile", icon: "User" },
  { label: "دعوت دوستان", href: "/dashboard/referral", icon: "UserPlus" },
  { label: "تنظیمات", href: "/dashboard/settings", icon: "Settings" },
  {
    label: "دستیار هوشمند",
    href: "/dashboard/assistant",
    icon: "Sparkles",
  },
  {
    label: "مدیریت مجله",
    href: "/dashboard/blog",
    icon: "Newspaper",
    adminOnly: true,
  },
];

export const DASHBOARD_STATS = [
  {
    id: "production",
    label: "تولید امروز",
    value: "۷۲۰",
    suffix: "kWh",
    change: "↑ ۱۲٪ نسبت به دیروز",
    trend: "up" as const,
    icon: "Sun" as const,
    color: "amber" as const,
  },
  {
    id: "earnings",
    label: "درآمد ماه جاری",
    value: "۱۲٫۸",
    suffix: "میلیون تومان",
    change: "↑ ۸٪ نسبت به ماه قبل",
    trend: "up" as const,
    icon: "Receipt" as const,
    color: "green" as const,
  },
  {
    id: "contracts",
    label: "قراردادهای فعال",
    value: "۲",
    suffix: "قرارداد",
    change: "۱ فروش · ۱ نصب",
    trend: "neutral" as const,
    icon: "FileCheck" as const,
    color: "violet" as const,
  },
  {
    id: "total-earnings",
    label: "دریافتی سالانه",
    value: "۱۲۸",
    suffix: "میلیون تومان",
    change: "↑ ۱۴٪ نسبت به سال قبل",
    trend: "up" as const,
    icon: "BarChart3" as const,
    color: "blue" as const,
  },
];

export const QUICK_ACTIONS = [
  {
    label: "درخواست نصب",
    href: "/dashboard/install",
    icon: "ClipboardList" as const,
    description: "نیروگاه جدید",
  },
  {
    label: "دستیار هوشمند",
    href: "/dashboard/assistant",
    icon: "Sparkles" as const,
    description: "سؤال و تحلیل",
  },
  {
    label: "صورت‌حساب‌ها",
    href: "/dashboard/invoices",
    icon: "Receipt" as const,
    description: "۲ در انتظار",
  },
  {
    label: "قراردادها",
    href: "/dashboard/contracts",
    icon: "FileCheck" as const,
    description: "مشاهده و دانلود",
  },
  {
    label: "نیروگاه من",
    href: "/dashboard/plant",
    icon: "Sun" as const,
    description: "وضعیت و آمار",
  },
];
