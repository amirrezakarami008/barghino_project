import type { AccountType, UserPath } from "./types";

export const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    value: "individual",
    label: "حقیقی",
    title: "مشترک خانگی",
    description: "ثبت‌نام با شماره موبایل و کد ملی",
  },
];

export const USER_PATHS: {
  value: UserPath;
  label: string;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    value: "sell",
    label: "مسیر A",
    title: "فروش برق نیروگاهم",
    description: "نیروگاه خورشیدی دارم و می‌خواهم برق را به برقینو بفروشم",
    href: "/dashboard/buy",
  },
  {
    value: "install",
    label: "مسیر B",
    title: "درخواست نصب نیروگاه",
    description: "هنوز نیروگاه ندارم؛ می‌خواهم برقینو نصب کند",
    href: "/dashboard/install",
  },
];

export const AUTH_COPY = {
  brandHint: "برق خانگی‌ات را گران‌تر بفروش؛ یا برای نصب نیروگاه درخواست بده.",
  login: {
    eyebrow: "دسترسی به پنل",
    title: "ورود",
    subtitle: "مسیر فروش برق خانگی از همین‌جا ادامه پیدا می‌کند.",
    individualHint: "شماره همراه خود را وارد کنید.",
    submitPassword: "ورود به سامانه",
    submitOtpRequest: "ارسال کد یکبارمصرف",
    submitOtpVerify: "تأیید کد و ورود",
    switchToOtp: "رمز یکبارمصرف",
    switchToPassword: "رمز عبور",
    forgotPassword: "رمز را فراموش کرده‌ام",
    noAccount: "حساب ندارید؟",
    registerLink: "ثبت‌نام",
  },
  register: {
    eyebrow: "عضویت در برقینو",
    title: "ثبت‌نام",
    subtitle: "حساب خانگی بساز و مسیر فروش یا نصب را انتخاب کن.",
    chooseTitle: "از کجا شروع می‌کنی؟",
    chooseHint: "بعداً هم می‌توانی مسیر دیگر را از پنل انتخاب کنی.",
    identityTitle: "اطلاعات هویتی",
    securityTitle: "امنیت حساب",
    individualHint: "اطلاعات مطابق کارت ملی وارد شود.",
    next: "ادامه",
    back: "بازگشت",
    submit: "تکمیل ثبت‌نام",
    hasAccount: "قبلاً ثبت‌نام کرده‌اید؟",
    loginLink: "ورود",
    termsPrefix: "شرایط و مقررات را می‌پذیرم.",
    termsLink: "مشاهده شرایط",
  },
} as const;

export const AUTH_FIELDS = {
  phone: {
    name: "phone",
    label: "شماره موبایل",
    placeholder: "۰۹۱۲۳۴۵۶۷۸۹",
    maxLength: 11,
  },
  nationalId: {
    name: "nationalId",
    label: "کد ملی",
    placeholder: "۱۰ رقم",
    maxLength: 10,
  },
  fullName: {
    name: "fullName",
    label: "نام و نام خانوادگی",
    placeholder: "مطابق کارت ملی",
  },
  password: {
    name: "password",
    label: "رمز عبور",
    placeholder: "۸ تا ۲۴ کاراکتر",
    minLength: 8,
    maxLength: 24,
  },
  confirmPassword: {
    name: "confirmPassword",
    label: "تکرار رمز عبور",
    placeholder: "تکرار رمز",
  },
  otp: {
    name: "otp",
    label: "کد یکبارمصرف",
    placeholder: "------",
    maxLength: 6,
  },
} as const;
