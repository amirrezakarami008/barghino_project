import type { ServiceItem } from "@/shared/types";

/** Hub listing for /services — home-focused paths only */
export const SERVICES: ServiceItem[] = [
  {
    id: "sell",
    slug: "sell-home-power",
    title: "فروش برق خانگی",
    description: "برق تولیدی نیروگاه خانگی را با نرخ بورس سبز به برقینو بفروشید",
    href: "/services/sell-home-power",
    icon: "Zap",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    id: "install",
    slug: "solar-home-install",
    title: "نصب نیروگاه خورشیدی",
    description: "اگر نیروگاه ندارید، درخواست احداث بدهید و بعد وارد مسیر فروش شوید",
    href: "/services/solar-home-install",
    icon: "Sun",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    id: "support",
    slug: "support-path",
    title: "پشتیبانی و پیگیری",
    description: "راهنمایی مدارک، قرارداد و وضعیت پرداخت",
    href: "/services/support-path",
    icon: "Headphones",
    gradient: "from-slate-600 to-slate-800",
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}

export function getAllServiceSlugs() {
  return SERVICES.map((service) => service.slug);
}
