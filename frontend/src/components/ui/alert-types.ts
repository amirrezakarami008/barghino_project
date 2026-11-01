import type { ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "danger" | "neutral";

/** @deprecated Use `AlertVariant`. Kept for existing `tone` call sites. */
export type AlertTone = Exclude<AlertVariant, "neutral">;

export type AlertActionVariant = "primary" | "secondary" | "ghost";

export type AlertAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: AlertActionVariant;
};

export type AlertListItem = {
  id?: string;
  label: ReactNode;
  /** Optional in-page field anchor, e.g. `#field-phone` */
  href?: string;
};

export type AlertDescriptor = {
  id: string;
  variant: AlertVariant;
  /** Logical placement key consumed by `<AlertSlot placement="..." />`. */
  placement: string;
  /** Higher wins within the same severity. Default 0. */
  priority?: number;
  title: string;
  description?: ReactNode;
  items?: AlertListItem[];
  actions?: AlertAction[];
  dismissKey?: string;
  /** Same consequence → keep highest severity only in one view. */
  consequenceKey?: string;
  compact?: boolean;
  details?: ReactNode;
  dismissible?: boolean;
  icon?: ReactNode;
};

export type AlertHandle = {
  focus: () => void;
};

export const ALERT_SEVERITY: Record<AlertVariant, number> = {
  danger: 50,
  warning: 40,
  success: 30,
  info: 20,
  neutral: 10,
};
