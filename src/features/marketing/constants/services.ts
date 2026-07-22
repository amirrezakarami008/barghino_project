import type { ServiceItem } from "@/shared/types";

export const SERVICES: ServiceItem[] = [
  {
    id: "power-supply",
    slug: "power-supply",
    title: "تامین برق مصرفی",
    description: "تامین برق برای واحدهای صنعتی، تجاری، اداری و مسکونی",
    href: "/services/power-supply",
    icon: "Plug",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    id: "uninterrupted",
    slug: "uninterrupted-power",
    title: "تامین برق خاموشی",
    description: "کنترل خاموشی‌ها با برق آزاد، برق سبز و گواهی اوج",
    href: "/services/uninterrupted-power",
    icon: "ShieldCheck",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    id: "optimization",
    slug: "optimization",
    title: "صرفه‌جویی و بهینه‌سازی",
    description: "مشاوره، طراحی و اجرای راهکارهای کاهش جرائم و مصرف",
    href: "/services/optimization",
    icon: "Gauge",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    id: "consulting",
    slug: "energy-consulting",
    title: "مشاوره انرژی",
    description: "راهکارهای تخصصی برای تامین، تولید و مدیریت هوشمند انرژی",
    href: "/services/energy-consulting",
    icon: "Lightbulb",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    id: "renewable",
    slug: "renewable",
    title: "احداث نیروگاه تجدیدپذیر",
    description: "مشاوره، طراحی، تجهیز و مدیریت نیروگاه با رویکرد پایدار",
    href: "/services/renewable",
    icon: "Sun",
    gradient: "from-yellow-500 to-amber-400",
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}

export function getAllServiceSlugs() {
  return SERVICES.map((service) => service.slug);
}
