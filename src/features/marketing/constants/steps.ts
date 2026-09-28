import type { StepItem } from "@/shared/types";

export const REGISTRATION_STEPS: StepItem[] = [
  {
    id: "register",
    step: 1,
    title: "ثبت‌نام",
    description: "حساب کاربری بساز و مسیر فروش یا نصب را انتخاب کن",
  },
  {
    id: "connect",
    step: 2,
    title: "اتصال نیروگاه یا درخواست نصب",
    description: "اگر نیروگاه داری معرفی کن؛ نداری درخواست نصب بده",
  },
  {
    id: "earn",
    step: 3,
    title: "فروش و دریافت درآمد",
    description: "فصل گرم قیمت بالاتر، فصل سرد کف قیمت قراردادی؛ پرداخت حداکثر ۲ ماه",
  },
];
