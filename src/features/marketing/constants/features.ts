import type { FeatureItem } from "@/shared/types";

export const FEATURES: FeatureItem[] = [
  {
    id: "green-price",
    title: "قیمت بورس سبز",
    description: "فروش برق خانگی با نرخی بالاتر از مسیر پایه دولتی",
    icon: "TrendingDown",
  },
  {
    id: "fast-pay",
    title: "پرداخت تضمینی",
    description: "تسویه حداکثر تا ۲ ماه، نه انتظار چندماهه",
    icon: "Zap",
  },
  {
    id: "install",
    title: "مسیر نصب",
    description: "اگر نیروگاه نداری، درخواست احداث بده",
    icon: "Sun",
  },
  {
    id: "home",
    title: "مخصوص خانگی",
    description: "تمرکز روی مشترک خانگی، نه مدل صنعتی پیچیده",
    icon: "ShieldCheck",
  },
];
