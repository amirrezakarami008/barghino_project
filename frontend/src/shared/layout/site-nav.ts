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
  { href: "/sell", label: "فروش برق" },
  { href: "/install", label: "نصب نیروگاه" },
  { href: "/blog", label: "مجله" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
] as const satisfies readonly NavItem[];

export const userNav = [
  { href: "/panel", label: "خانه", end: true, icon: "home", summary: "وضعیت حساب، نیروگاه و گام بعدی." },
  { href: "/panel/plant", label: "نیروگاه من", icon: "plant", summary: "مشخصات نیروگاه و انشعاب بعد از ثبت." },
  { href: "/panel/production", label: "تولید و درآمد", icon: "chart", summary: "نمودار تولید وقتی قرائت واقعی برسد.", disabled: true },
  { href: "/panel/contracts", label: "قراردادها", icon: "file", summary: "قرارداد فروش یا نصب و وضعیت امضا." },
  { href: "/panel/invoices", label: "صورت‌حساب‌ها", icon: "card", summary: "دوره‌های فروش و سررسید تسویه.", disabled: true },
  { href: "/panel/payments", label: "پرداخت‌ها", icon: "coins", summary: "واریز، شبا و کیف پول.", disabled: true },
  { href: "/panel/install", label: "درخواست نصب", icon: "sun", summary: "پیگیری احداث از ثبت تا بهره‌برداری.", disabled: true },
  { href: "/panel/documents", label: "مدارک", icon: "file", summary: "اسناد هویتی و فایل‌های قرارداد.", disabled: true },
  { href: "/panel/notifications", label: "اعلان‌ها", icon: "bell", summary: "رویدادهای حساب، بدون عدد ساختگی.", disabled: true },
  { href: "/panel/support", label: "پشتیبانی", icon: "headset", summary: "تیکت فروش، نصب، پرداخت یا قرارداد.", disabled: true },
  { href: "/panel/profile", label: "پروفایل", icon: "user", summary: "نام، موبایل و مسیر انتخاب‌شده." },
  { href: "/panel/settings", label: "تنظیمات", icon: "settings", summary: "ترجیح اعلان و امنیت حساب.", disabled: true },
] as const satisfies readonly NavItem[];

export const adminNav = [
  { href: "/admin", label: "نمای کلی", end: true, icon: "grid", summary: "میز عملیات و دسترسی به بخش‌های مدیریت." },
  { href: "/admin/plans", label: "پلن‌های فروش", icon: "plan", summary: "نرخ و حجم تعهد پلن‌های فروش." },
  { href: "/admin/plants", label: "نیروگاه‌ها", icon: "solarPanel", summary: "ثبت، ویرایش، حذف و تأیید نیروگاه‌های کاربران." },
  { href: "/admin/reviews", label: "بررسی درخواست‌ها", icon: "shield", summary: "تأیید انشعاب، نیروگاه و قراردادهای امضاشده." },
  { href: "/admin/equipment", label: "تجهیزات", icon: "solarPanel", summary: "قیمت و اقلام کاتالوگ نصب.", disabled: true },
  { href: "/admin/journal", label: "مجله و راهنماها", icon: "book", summary: "جست‌وجو و مشاهده راهنماهای منتشرشدهٔ سایت." },
  { href: "/admin/profile", label: "پروفایل", icon: "user", summary: "اطلاعات حساب و مشخصات مدیر." },
] as const satisfies readonly NavItem[];

export function isNavActive(pathname: string, item: Pick<NavItem, "href" | "end">) {
  if (item.end) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
