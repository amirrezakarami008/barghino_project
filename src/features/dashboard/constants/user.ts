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

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "داشبورد", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "نیروگاه من", href: "/dashboard/plant", icon: "Sun" },
  { label: "دستیار هوشمند", href: "/dashboard/assistant", icon: "Sparkles" },
  { label: "تولید و درآمد", href: "/dashboard/production", icon: "BarChart3" },
  { label: "گزارش ماهانه", href: "/dashboard/reports", icon: "FileText" },
  { label: "بورس سبز", href: "/dashboard/exchange", icon: "TrendingUp" },
  { label: "قراردادها", href: "/dashboard/contracts", icon: "FileCheck" },
  { label: "صورت‌حساب‌ها", href: "/dashboard/invoices", icon: "Receipt", badge: 2 },
  { label: "پرداخت‌ها", href: "/dashboard/payments", icon: "CreditCard" },
  { label: "اعلان‌ها", href: "/dashboard/notifications", icon: "Bell", badge: 2 },
  { label: "پشتیبانی", href: "/dashboard/support", icon: "Headphones" },
  { label: "مدارک", href: "/dashboard/documents", icon: "FolderOpen" },
  { label: "درخواست نصب", href: "/dashboard/install", icon: "ClipboardList" },
  {
    label: "مدیریت مجله",
    href: "/dashboard/blog",
    icon: "Newspaper",
    adminOnly: true,
  },
  { label: "پروفایل", href: "/dashboard/profile", icon: "User" },
  { label: "تنظیمات", href: "/dashboard/settings", icon: "Settings" },
];

export const DASHBOARD_STATS = [
  {
    id: "production",
    label: "تولید ماه جاری",
    value: "۷۲۰",
    suffix: "kWh",
    change: "↑ ۱۲٪ نسبت به ماه قبل",
    trend: "up" as const,
    icon: "Sun" as const,
    color: "amber" as const,
  },
  {
    id: "earnings",
    label: "درآمد ماه جاری",
    value: "۱۰٫۸",
    suffix: "میلیون تومان",
    change: "نرخ بورس سبز: ۱۵٬۰۰۰ تومان/kWh",
    trend: "up" as const,
    icon: "Receipt" as const,
    color: "green" as const,
  },
  {
    id: "contracts",
    label: "قرارداد فعال",
    value: "۲",
    suffix: "قرارداد",
    change: "هر دو نیروگاه فعال",
    trend: "neutral" as const,
    icon: "FileCheck" as const,
    color: "violet" as const,
  },
  {
    id: "total-earnings",
    label: "درآمد سالانه",
    value: "۱۲۸",
    suffix: "میلیون تومان",
    change: "↑ ۱۸٪ نسبت به سال قبل",
    trend: "up" as const,
    icon: "BarChart3" as const,
    color: "blue" as const,
  },
];

export const QUICK_ACTIONS = [
  {
    label: "نیروگاه من",
    href: "/dashboard/plant",
    icon: "Sun" as const,
    description: "وضعیت و آمار نیروگاه",
  },
  {
    label: "قراردادها",
    href: "/dashboard/contracts",
    icon: "FileCheck" as const,
    description: "مشاهده، دانلود و بارگذاری",
  },
  {
    label: "صورت‌حساب‌ها",
    href: "/dashboard/invoices",
    icon: "Receipt" as const,
    description: "۲ صورت‌حساب در انتظار",
  },
  {
    label: "دستیار هوشمند",
    href: "/dashboard/assistant",
    icon: "Sparkles" as const,
    description: "سؤال بپرس، تحلیل بگیر",
  },
  {
    label: "درخواست نصب",
    href: "/dashboard/install",
    icon: "ClipboardList" as const,
    description: "نیروگاه جدید اضافه کنید",
  },
];
