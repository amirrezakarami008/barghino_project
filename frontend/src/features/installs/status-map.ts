import type { StatusTone } from "@/components/ui";
import type { IconName } from "@/shared/ui/icon";

/** Stages observed from /api/v1/installs/ — only map known values. */
const map: Record<
  string,
  { tone: StatusTone; label: string; next: string; icon: IconName }
> = {
  draft: {
    tone: "draft",
    label: "پیش‌نویس",
    next: "اطلاعات و تصاویر را کامل کنید، سپس درخواست را ارسال کنید.",
    icon: "file",
  },
  submitted: {
    tone: "pending",
    label: "ارسال‌شده",
    next: "درخواست نزد شرکت است و منتظر بررسی اولیه رسانه می‌ماند.",
    icon: "sun",
  },
  visit_scheduled: {
    tone: "pending",
    label: "بازدید زمان‌بندی‌شده",
    next: "بازدید میدانی هماهنگ شده و منتظر انجام است.",
    icon: "home",
  },
  proposed: {
    tone: "pending",
    label: "پیشنهاد ثبت‌شده",
    next: "پیشنهاد فنی و مالی آماده است و مسیر قرارداد ادامه می‌یابد.",
    icon: "file",
  },
  contract: {
    tone: "active",
    label: "قرارداد",
    next: "قرارداد نصب در جریان است.",
    icon: "file",
  },
  installation: {
    tone: "active",
    label: "در حال نصب",
    next: "اجرای نصب در محل در حال انجام است.",
    icon: "plant",
  },
  active: {
    tone: "active",
    label: "فعال",
    next: "نیروگاه فعال شده و درخواست بسته است.",
    icon: "bolt",
  },
  rejected: {
    tone: "rejected",
    label: "ردشده",
    next: "درخواست رد شده است؛ در صورت نیاز درخواست جدید ثبت کنید.",
    icon: "file",
  },
};

const fallback = {
  tone: "draft" as StatusTone,
  label: "وضعیت نامشخص",
  next: "وضعیت این درخواست قابل تشخیص نیست؛ تازه‌سازی کنید.",
  icon: "file" as IconName,
};

export function installStatusMeta(stage: string) {
  return Object.hasOwn(map, stage) ? map[stage]! : { ...fallback, label: stage || fallback.label };
}
