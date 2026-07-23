import type { AccountType } from "./types";

export const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    value: "individual",
    label: "حقیقی",
    title: "شخص حقیقی",
    description: "ورود و ثبت‌نام با شماره موبایل و کد ملی",
  },
  {
    value: "legal",
    label: "حقوقی",
    title: "شخص حقوقی",
    description: "ورود و ثبت‌نام شرکت با شناسه ملی",
  },
];

export const AUTH_COPY = {
  brandHint: "برق را هوشمند بخر؛ هزینه را هوشمند کم کن.",
  login: {
    eyebrow: "دسترسی به پنل",
    title: "ورود",
    subtitle: "مسیر تامین برق از همین‌جا ادامه پیدا می‌کند.",
    individualHint: "شماره همراه خود را وارد کنید.",
    legalHint: "شناسه ملی شرکت را وارد کنید.",
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
    eyebrow: "عضویت در برق ما",
    title: "ثبت‌نام",
    subtitle: "در چند قدم کوتاه حساب خود را بسازید.",
    chooseTitle: "نوع حساب را انتخاب کنید",
    chooseHint: "مسیر ثبت‌نام بر اساس نوع حساب تنظیم می‌شود.",
    identityTitle: "اطلاعات هویتی",
    securityTitle: "امنیت حساب",
    individualHint: "اطلاعات مطابق کارت ملی وارد شود.",
    legalHint: "اطلاعات ثبتی شرکت و نماینده را وارد کنید.",
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
  companyNationalId: {
    name: "companyNationalId",
    label: "شناسه ملی",
    placeholder: "۸ تا ۱۲ رقم",
    maxLength: 12,
  },
  fullName: {
    name: "fullName",
    label: "نام و نام خانوادگی",
    placeholder: "مطابق کارت ملی",
  },
  companyName: {
    name: "companyName",
    label: "نام شرکت",
    placeholder: "نام رسمی شرکت",
  },
  agentName: {
    name: "agentName",
    label: "نام نماینده",
    placeholder: "نماینده مجاز شرکت",
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
