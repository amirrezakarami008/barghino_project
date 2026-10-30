import type { IconName } from "@/shared/ui/icon";

export type NavItem = {
  href: string;
  label: string;
  end?: boolean;
  summary?: string;
  icon?: IconName;
  disabled?: boolean;
};

export const publicNav = [
  { href: "/", label: "خانه", end: true },
  { href: "/services", label: "خدمات" },
  { href: "/learn", label: "آموزش" },
  { href: "/contact", label: "تماس" },
] as const satisfies readonly NavItem[];

export const publicServiceLinks = [
  {
    href: "/services#sell",
    label: "فروش برق",
    description: "نیروگاه دارم و می‌خواهم بفروشم",
    icon: "bolt",
  },
  {
    href: "/services#install",
    label: "نصب نیروگاه",
    description: "هنوز نیروگاه ندارم",
    icon: "plant",
  },
] as const satisfies readonly (NavItem & { description: string; icon: IconName })[];

export const userNav = [
  { href: "/panel", label: "خانه", end: true, icon: "home", summary: "وضعیت حساب و گام بعدی." },
  { href: "/panel/contracts", label: "قراردادهای من", icon: "file", summary: "پیش‌نویس تا فعال شدن قرارداد." },
  { href: "/panel/plant", label: "نیروگاه من", icon: "solarPanel", summary: "ظرفیت، نشانی و وضعیت بررسی." },
  { href: "/panel/profile", label: "پروفایل", icon: "user", summary: "هویت و تأیید موبایل." },
  { href: "/panel/production", label: "تولید و درآمد", icon: "chart", summary: "نمودار تولید وقتی قرائت واقعی برسد.", disabled: true },
  { href: "/panel/invoices", label: "صورت‌حساب‌ها", icon: "card", summary: "دوره‌های فروش و سررسید تسویه.", disabled: true },
  { href: "/panel/payments", label: "پرداخت‌ها", icon: "coins", summary: "واریز، شبا و کیف پول.", disabled: true },
  { href: "/panel/install", label: "درخواست نصب", icon: "sun", summary: "پیگیری احداث از ثبت تا بهره‌برداری.", disabled: true },
  { href: "/panel/documents", label: "مدارک", icon: "file", summary: "اسناد هویتی و فایل‌های قرارداد.", disabled: true },
  { href: "/panel/notifications", label: "اعلان‌ها", icon: "bell", summary: "رویدادهای حساب، بدون عدد ساختگی.", disabled: true },
  { href: "/panel/support", label: "پشتیبانی", icon: "headset", summary: "تیکت فروش، نصب، پرداخت یا قرارداد.", disabled: true },
] as const satisfies readonly NavItem[];

export const adminNav = [
  { href: "/admin", label: "نمای کلی", end: true, icon: "grid", summary: "میز عملیات و دسترسی به بخش‌های مدیریت." },
  { href: "/admin/plans", label: "پلن‌های فروش", icon: "plan", summary: "نرخ و حجم تعهد پلن‌های فروش." },
  { href: "/admin/plants", label: "نیروگاه‌ها", icon: "solarPanel", summary: "ثبت، ویرایش، حذف و تأیید نیروگاه‌های کاربران." },
  { href: "/admin/reviews", label: "بررسی درخواست‌ها", icon: "shield", summary: "تأیید انشعاب، نیروگاه و قراردادهای امضاشده." },
  { href: "/admin/equipment", label: "تجهیزات", icon: "solarPanel", summary: "قیمت و اقلام کاتالوگ نصب.", disabled: true },
  { href: "/admin/journal", label: "راهنماها", icon: "book", summary: "جست‌وجو و مشاهده راهنماهای منتشرشدهٔ سایت." },
  { href: "/admin/profile", label: "پروفایل", icon: "user", summary: "اطلاعات حساب و مشخصات مدیر." },
] as const satisfies readonly NavItem[];

export function isNavActive(pathname: string, item: Pick<NavItem, "href" | "end">) {
  if (item.end) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
