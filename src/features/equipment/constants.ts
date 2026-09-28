import type { EquipmentCategory, EquipmentItem, EquipmentPricingMode } from "@/shared/types/equipment";

export const EQUIPMENT_STORAGE_KEY = "barghino:equipment-catalog-v1";
export const EQUIPMENT_UPDATED_EVENT = "barghino:equipment-updated";

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  panel: "پنل خورشیدی",
  inverter: "اینورتر",
  mounting: "سازه و نصب",
  cabling: "کابل و اتصالات",
  protection: "حفاظت و تابلو",
  battery: "باتری",
  other: "سایر",
};

export const EQUIPMENT_PRICING_MODE_LABELS: Record<EquipmentPricingMode, string> = {
  per_kwp: "به‌ازای هر کیلووات",
  per_unit: "به‌ازای هر واحد",
  fixed: "مبلغ ثابت (یک‌بار)",
};

export const EQUIPMENT_CATEGORY_OPTIONS = Object.entries(EQUIPMENT_CATEGORY_LABELS).map(
  ([id, label]) => ({ id: id as EquipmentCategory, label }),
);

export const EQUIPMENT_PRICING_MODE_OPTIONS = Object.entries(EQUIPMENT_PRICING_MODE_LABELS).map(
  ([id, label]) => ({ id: id as EquipmentPricingMode, label }),
);

/** کاتالوگ نمونه تجهیزات خورشیدی — قیمت‌ها تقریبی و قابل ویرایش در پنل ادمین */
export const SEED_EQUIPMENT: EquipmentItem[] = [
  {
    id: "eq-panel-longi-550",
    name: "پنل مونوکریستال ۵۵۰ وات",
    category: "panel",
    brand: "Longi",
    description: "بازده بالا، مناسب پشت‌بام خانگی",
    capacityW: 550,
    unitPriceToman: 3_850_000,
    pricingMode: "per_unit",
    unitLabel: "عدد",
    active: true,
    showInPriceList: true,
    source: "seed",
  },
  {
    id: "eq-panel-ja-450",
    name: "پنل مونوکریستال ۴۵۰ وات",
    category: "panel",
    brand: "JA Solar",
    description: "گزینه اقتصادی با کیفیت پایدار",
    capacityW: 450,
    unitPriceToman: 2_950_000,
    pricingMode: "per_unit",
    unitLabel: "عدد",
    active: false,
    showInPriceList: true,
    source: "seed",
  },
  {
    id: "eq-inverter-huawei-5",
    name: "اینورتر استرینگ ۵ کیلووات",
    category: "inverter",
    brand: "Huawei",
    description: "راندمان بالا و مانیتورینگ آنلاین",
    capacityW: 5000,
    unitPriceToman: 4_200_000,
    pricingMode: "per_kwp",
    unitLabel: "کیلووات",
    active: true,
    showInPriceList: true,
    source: "seed",
  },
  {
    id: "eq-inverter-growatt-10",
    name: "اینورتر هیبرید ۱۰ کیلووات",
    category: "inverter",
    brand: "Growatt",
    description: "آماده اتصال باتری برای آینده",
    capacityW: 10000,
    unitPriceToman: 5_800_000,
    pricingMode: "per_kwp",
    unitLabel: "کیلووات",
    active: false,
    showInPriceList: true,
    source: "seed",
  },
  {
    id: "eq-mounting-alum",
    name: "سازه آلومینیومی پشت‌بام",
    category: "mounting",
    brand: "Barghino Mount",
    description: "اسکلت استاندارد ضدزنگ برای سقف صاف و شیب‌دار",
    unitPriceToman: 3_200_000,
    pricingMode: "per_kwp",
    unitLabel: "کیلووات",
    active: true,
    showInPriceList: true,
    source: "seed",
  },
  {
    id: "eq-cabling-dcac",
    name: "کابل و کانکتور DC/AC",
    category: "cabling",
    brand: "Nexans / MC4",
    description: "کابل خورشیدی، کانکتور و لوازم اتصال",
    unitPriceToman: 1_450_000,
    pricingMode: "per_kwp",
    unitLabel: "کیلووات",
    active: true,
    showInPriceList: true,
    source: "seed",
  },
  {
    id: "eq-protection-board",
    name: "تابلو و حفاظت الکتریکی",
    category: "protection",
    brand: "ABB / Schneider",
    description: "قطع‌کننده، SPD و تابلو AC/DC",
    unitPriceToman: 2_100_000,
    pricingMode: "per_kwp",
    unitLabel: "کیلووات",
    active: true,
    showInPriceList: true,
    source: "seed",
  },
  {
    id: "eq-battery-lithium-5",
    name: "باتری لیتیوم ۵ کیلووات‌ساعت",
    category: "battery",
    brand: "Pylontech",
    description: "اختیاری — ذخیره برای مصرف شبانه",
    capacityW: 5000,
    unitPriceToman: 48_000_000,
    pricingMode: "fixed",
    unitLabel: "عدد",
    active: false,
    showInPriceList: true,
    source: "seed",
  },
  {
    id: "eq-labor-install",
    name: "اجرت نصب و راه‌اندازی",
    category: "other",
    brand: "برقینو",
    description: "نصب، کابل‌کشی، تست و تحویل",
    unitPriceToman: 6_500_000,
    pricingMode: "per_kwp",
    unitLabel: "کیلووات",
    active: true,
    showInPriceList: false,
    source: "seed",
  },
];

/** هزینه پیش‌فرض وقتی هیچ تجهیز فعالی تعریف نشده */
export const DEFAULT_COST_PER_KWP = 45_000_000;
