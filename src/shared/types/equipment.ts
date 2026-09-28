export type EquipmentCategory =
  | "panel"
  | "inverter"
  | "mounting"
  | "cabling"
  | "protection"
  | "battery"
  | "other";

/** نحوه محاسبه هزینه در برآورد نصب */
export type EquipmentPricingMode = "per_kwp" | "per_unit" | "fixed";

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  description?: string;
  /** توان پنل/اینورتر بر حسب وات */
  capacityW?: number;
  unitPriceToman: number;
  pricingMode: EquipmentPricingMode;
  /**
   * برای حالت per_unit وقتی capacityW نیست:
   * تعداد تقریبی واحد به‌ازای هر kWp
   */
  unitsPerKwp?: number;
  /** واحد نمایشی قیمت (مثلاً «عدد»، «کیلووات») */
  unitLabel?: string;
  /** در محاسبه هزینه ماشین‌حساب لحاظ شود */
  active: boolean;
  /** در لیست قیمت عمومی نمایش داده شود */
  showInPriceList: boolean;
  source?: "seed" | "custom";
  updatedAt?: string;
}

export interface EquipmentCostLine {
  item: EquipmentItem;
  quantity: number;
  lineTotalToman: number;
}

export interface EquipmentCostEstimate {
  lines: EquipmentCostLine[];
  totalToman: number;
  costPerKwpToman: number;
}
