import type { InstallRequestStep } from "@/shared/types/dashboard";

export const INSTALL_STEP_ORDER: InstallRequestStep[] = [
  "submitted",
  "review",
  "visit",
  "proposal",
  "contract",
  "installation",
  "active",
];

export const INSTALL_STEPS = [
  {
    id: "submitted" as const,
    label: "ثبت درخواست",
    description: "اطلاعات ملک و تماس را وارد می‌کنید.",
  },
  {
    id: "review" as const,
    label: "بررسی اولیه",
    description: "با ارسال عکس یا ویدیو از پشت‌بام، کارشناسان (یا AI در آینده) بررسی می‌کنند.",
  },
  {
    id: "visit" as const,
    label: "بازدید کارشناس",
    description: "یک کارشناس برای ارزیابی پشت‌بام به محل مراجعه می‌کند.",
  },
  {
    id: "proposal" as const,
    label: "ارائه طرح و قیمت",
    description: "طرح فنی و پیشنهاد قیمت نهایی ارسال می‌شود.",
  },
  {
    id: "contract" as const,
    label: "امضای قرارداد",
    description: "قرارداد نصب و آماده‌سازی مسیر فروش امضا می‌شود.",
  },
  {
    id: "installation" as const,
    label: "نصب تجهیزات",
    description: "تیم فنی نیروگاه را نصب و به شبکه متصل می‌کند.",
  },
  {
    id: "active" as const,
    label: "راه‌اندازی و تحویل",
    description: "نیروگاه فعال می‌شود و می‌توانید فروش برق را شروع کنید.",
  },
];

export function getInstallStepIndex(step: InstallRequestStep) {
  return INSTALL_STEP_ORDER.indexOf(step);
}

export function getNextInstallStep(step: InstallRequestStep): InstallRequestStep | null {
  const idx = getInstallStepIndex(step);
  if (idx < 0 || idx >= INSTALL_STEP_ORDER.length - 1) return null;
  return INSTALL_STEP_ORDER[idx + 1] ?? null;
}

export function getInstallStepLabel(step: InstallRequestStep) {
  return INSTALL_STEPS.find((s) => s.id === step)?.label ?? step;
}
