import type { StatusTone } from "@/components/ui";
import type { IconName } from "@/shared/ui/icon";

/** Stages observed from /api/v1/installs/requests/ — only map known values. */
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
    next: "درخواست نزد شرکت است و منتظر بررسی اولیه می‌ماند.",
    icon: "sun",
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
