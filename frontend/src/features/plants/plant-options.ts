import type { IconName } from "@/shared/ui/icon";

export const SCHEME_TYPES = ["residential", "non_residential"] as const;
export const SYSTEM_TYPES = ["on_grid", "off_grid"] as const;

export type SchemeType = (typeof SCHEME_TYPES)[number];
export type SystemType = (typeof SYSTEM_TYPES)[number];

export type PlantChoiceOption<T extends string> = {
  readonly value: T;
  readonly label: string;
  readonly hint: string;
  readonly icon: IconName;
};

export const SCHEME_OPTIONS: readonly PlantChoiceOption<SchemeType>[] = [
  {
    value: "residential",
    label: "مسکونی",
    hint: "خانه، ویلا یا آپارتمان",
    icon: "home",
  },
  {
    value: "non_residential",
    label: "غیرمسکونی",
    hint: "تجاری، اداری یا صنعتی",
    icon: "grid",
  },
];

export const SYSTEM_OPTIONS: readonly PlantChoiceOption<SystemType>[] = [
  {
    value: "on_grid",
    label: "متصل به شبکه",
    hint: "آن‌گرید — امکان تزریق به شبکه",
    icon: "bolt",
  },
  {
    value: "off_grid",
    label: "مستقل از شبکه",
    hint: "آف‌گرید — بدون اتصال سراسری",
    icon: "sun",
  },
];

export function isSchemeType(value: unknown): value is SchemeType {
  return typeof value === "string" && (SCHEME_TYPES as readonly string[]).includes(value);
}

export function isSystemType(value: unknown): value is SystemType {
  return typeof value === "string" && (SYSTEM_TYPES as readonly string[]).includes(value);
}

export function schemeTypeLabel(value: string): string {
  return SCHEME_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function systemTypeLabel(value: string): string {
  return SYSTEM_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

/** Display label when the API omits plant name. */
export function defaultPlantName(input: {
  readonly schemeType?: string;
  readonly systemType?: string;
  readonly capacity?: string;
}): string {
  const scheme = isSchemeType(input.schemeType) ? schemeTypeLabel(input.schemeType) : "خورشیدی";
  const capacity = input.capacity?.trim();
  return capacity ? `نیروگاه ${scheme} ${capacity} kWp` : `نیروگاه ${scheme}`;
}
