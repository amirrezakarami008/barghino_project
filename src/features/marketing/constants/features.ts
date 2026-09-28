import type { FeatureItem } from "@/shared/types";

export const FEATURES: FeatureItem[] = [
  {
    id: "green-price",
    title: "قیمت بالاتر در فصل گرم",
    description:
      "وقتی تولید بیشتر است، با نرخ بورس سبز — بالاتر از تعرفه ثابت پایه — می‌خریم",
    icon: "TrendingDown",
  },
  {
    id: "cold-floor",
    title: "کف قیمت با قرارداد رسمی در فصل سرد",
    description: "حتی با تولید کمتر، خرید با قرارداد رسمی و ۱۰٪ بیشتر از نرخ پایه",
    icon: "ShieldCheck",
  },
  {
    id: "fast-pay",
    title: "پرداخت سریع",
    description: "تسویه حداکثر تا ۲ ماه، نه انتظار چندماهه مسیر پایه",
    icon: "Zap",
  },
  {
    id: "install",
    title: "مسیر یکپارچه نصب",
    description: "از درخواست احداث تا بهره‌برداری و فروش، کنار شماییم",
    icon: "Sun",
  },
  {
    id: "dashboard",
    title: "داشبورد هوشمند",
    description: "تولید، درآمد، قرارداد و پرداخت‌ها در یک پنل",
    icon: "LayoutDashboard",
  },
  {
    id: "support",
    title: "پشتیبانی همراه",
    description: "راهنمایی مدارک، قرارداد و وضعیت پرداخت",
    icon: "Headphones",
  },
];
