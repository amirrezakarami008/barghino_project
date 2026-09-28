import { SITE_CONFIG } from "@/config";
import type { ContractPlan } from "@/features/contracts/types";

export const PLANS_STORAGE_KEY = "barghino:contract-plans-v1";
export const PLANS_UPDATED_EVENT = "barghino:contract-plans-updated";

/** پلن‌های نمونه فروش برق — قابل ویرایش در پنل ادمین */
export const SEED_PLANS: ContractPlan[] = [
  {
    id: "basic",
    name: "پایه",
    tagline: "مناسب تولید متوسط خانگی",
    volume: "۴۸۰ kWh/ماه",
    rate: `${SITE_CONFIG.valueProps.barghinoPrice} تومان/kWh`,
    savings: "≈۳× پایه",
    features: ["خرید فصلی با قرارداد رسمی", "پرداخت حداکثر ۲ ماهه", "پشتیبانی استاندارد"],
    active: true,
    recommended: false,
    sortOrder: 1,
    source: "seed",
  },
  {
    id: "standard",
    name: "استاندارد",
    tagline: "پیشنهاد برقینو برای اکثر خانه‌ها",
    volume: "۷۲۰ kWh/ماه",
    rate: `${SITE_CONFIG.valueProps.barghinoPrice} تومان/kWh`,
    savings: "≈۳× پایه",
    features: ["خرید فصلی با قرارداد رسمی", "اولویت تسویه", "گزارش تولید ماهانه", "پشتیبانی اولویت‌دار"],
    active: true,
    recommended: true,
    sortOrder: 2,
    source: "seed",
  },
  {
    id: "premium",
    name: "ویژه",
    tagline: "حداکثر ظرفیت و نرخ فصل گرم",
    volume: "۱٬۲۰۰ kWh/ماه",
    rate: "۱۶٬۵۰۰ تومان/kWh",
    savings: "≈۳٫۳× پایه",
    features: [
      "نرخ بالاتر فصل گرم",
      "کف قیمت فصل سرد +۱۰٪ بالای پایه",
      "تسویه سریع‌تر",
      "پشتیبان اختصاصی",
    ],
    active: true,
    recommended: false,
    sortOrder: 3,
    source: "seed",
  },
];
