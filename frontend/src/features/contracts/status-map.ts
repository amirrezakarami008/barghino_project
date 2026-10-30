import type { StatusTone } from "@/components/ui";

const map: Record<string, { tone: StatusTone; label: string; next: string }> = {
  draft: {
    tone: "draft",
    label: "پیش‌نویس",
    next: "شرایط را مرور کنید؛ امضا وقتی سند رسمی آماده شود فعال می‌شود.",
  },
  pending: {
    tone: "pending",
    label: "در انتظار بررسی شرکت",
    next: "قرارداد نزد شرکت است و منتظر تصمیم می‌ماند.",
  },
  active: {
    tone: "active",
    label: "فعال",
    next: "شرکت این قرارداد را تأیید کرده است.",
  },
  cancelled: {
    tone: "closed",
    label: "بسته‌شده",
    next: "این نسخه بسته شده است؛ در صورت نیاز پیش‌نویس جدید بسازید.",
  },
  expired: {
    tone: "expired",
    label: "منقضی",
    next: "اعتبار این قرارداد به پایان رسیده است.",
  },
};

const fallback = {
  tone: "draft" as StatusTone,
  label: "وضعیت نامشخص",
  next: "وضعیت این قرارداد قابل تشخیص نیست؛ تازه‌سازی کنید.",
};

export function contractStatusMeta(status: string) {
  return Object.hasOwn(map, status) ? map[status]! : fallback;
}

export function plantStatusMeta(status: string): { tone: StatusTone; label: string } {
  if (status === "active") return { tone: "approved", label: "تأییدشده" };
  if (status === "pending") return { tone: "pending", label: "در انتظار بررسی" };
  if (status === "inactive") return { tone: "rejected", label: "رد شده / غیرفعال" };
  if (status === "maintenance") return { tone: "draft", label: "در حال تعمیر" };
  return { tone: "draft", label: "وضعیت نامشخص" };
}
