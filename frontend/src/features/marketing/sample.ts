/** Illustrative product samples — never present as live account data. */
export const sampleOffer = {
  statePrice: 5000,
  barghinoPrice: 15000,
  stateWait: "تا حدود ۶ ماه",
  barghinoWait: "حداکثر ۲ ماه",
  todayProduction: 32.5,
  disclaimer: "اعداد نمونه محصول‌اند، نه نرخ زنده بورس و نه قرائت یک نیروگاه واقعی.",
} as const;

export const samplePlans = [
  {
    id: "base",
    name: "پایه",
    buyRate: 12000,
    energyCommitment: "تعهد انرژی محدود · نمونه",
    benefits: ["قرارداد رسمی مکتوب", "پیگیری وضعیت در پنل", "پشتیبانی روزکاری"],
    recommended: false,
  },
  {
    id: "standard",
    name: "استاندارد",
    buyRate: 15000,
    energyCommitment: "تعهد متوسط سالانه · نمونه",
    benefits: ["نرخ خرید نمونه بالاتر", "تسویه طبق قرارداد", "اولویت بررسی مدارک", "تاریخچه وضعیت قابل مشاهده"],
    recommended: true,
  },
  {
    id: "pro",
    name: "ویژه",
    buyRate: 16500,
    energyCommitment: "تعهد منعطف توافقی · نمونه",
    benefits: ["شرایط توافقی در قرارداد", "مسیر بررسی شفاف", "ذخیره خصوصی مدارک"],
    recommended: false,
  },
] as const;
