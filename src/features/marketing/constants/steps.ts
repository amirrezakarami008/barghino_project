import type { StepItem } from "@/shared/types";

export const REGISTRATION_STEPS: StepItem[] = [
  {
    id: "register",
    step: 1,
    title: "تکمیل ثبت‌نام",
    description: "وارد کردن اطلاعات و تکمیل مراحل ثبت‌نام در کمتر از ۳ دقیقه",
  },
  {
    id: "bill-id",
    step: 2,
    title: "افزودن شناسه قبض",
    description: "مدیریت شناسه‌ها، برنامه‌ریزی و صرفه‌جویی هوشمندانه",
  },
  {
    id: "purchase",
    step: 3,
    title: "خرید آسان برق",
    description: "انتخاب سرویس مناسب و بهره‌مندی از مزایای اختصاصی",
  },
];
