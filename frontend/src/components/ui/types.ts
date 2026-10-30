export type StatusTone =
  | "pending"
  | "approved"
  | "rejected"
  | "draft"
  | "active"
  | "closed"
  | "expired";

export const STATUS_LABELS: Record<StatusTone, string> = {
  pending: "در انتظار",
  approved: "تأیید شده",
  rejected: "رد شده",
  draft: "پیش‌نویس",
  active: "فعال",
  closed: "بسته",
  expired: "منقضی",
};
