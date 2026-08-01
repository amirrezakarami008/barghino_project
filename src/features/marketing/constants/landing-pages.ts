import type { LandingPageContent } from "@/shared/types";
import { IMAGES } from "@/shared/constants/images";
import { SITE_CONFIG } from "@/config";

const { valueProps } = SITE_CONFIG;

export const SOLAR_HOME_PAGE: LandingPageContent = {
  meta: {
    title: "درخواست نصب نیروگاه خورشیدی",
    description:
      "اگر نیروگاه خورشیدی خانگی ندارید، درخواست بدهید تا برقینو مسیر احداث را برایتان جلو ببرد.",
    badge: "مسیر نصب",
  },
  hero: {
    title: "نیروگاه نداری؟",
    highlight: "برات نصب می‌کنیم",
    description:
      "از درخواست تا بهره‌برداری کنار شما هستیم. بعد از راه‌اندازی، می‌توانید برق تولیدی را با نرخ بورس سبز به برقینو بفروشید.",
    image: IMAGES.landing.solar,
  },
  features: [
    {
      id: "f1",
      title: "بررسی اولیه رایگان",
      description: "ارزیابی پشت‌بام، تابش و ظرفیت تقریبی تولید",
      icon: "Lightbulb",
    },
    {
      id: "f2",
      title: "پیشنهاد شفاف",
      description: "برآورد فنی و مالی قبل از عقد قرارداد احداث",
      icon: "Sun",
    },
    {
      id: "f3",
      title: "نصب استاندارد",
      description: "اجرا با تجهیزات معتبر و استاندارد ملی",
      icon: "ShieldCheck",
    },
    {
      id: "f4",
      title: "ورود به فروش",
      description: "پس از بهره‌برداری، فروش برق به برقینو را شروع کنید",
      icon: "Plug",
    },
  ],
  steps: [
    { id: "s1", step: 1, title: "درخواست", description: "ثبت درخواست نصب نیروگاه خورشیدی خانگی" },
    { id: "s2", step: 2, title: "بازدید و پیشنهاد", description: "بررسی محل و ارائه طرح فنی/مالی" },
    { id: "s3", step: 3, title: "قرارداد و نصب", description: "عقد قرارداد احداث و اجرای پروژه" },
    { id: "s4", step: 4, title: "فروش برق", description: "بهره‌برداری و فروش تولید به برقینو" },
  ],
  sections: [
    {
      id: "sec1",
      title: "چرا نصب با برقینو؟",
      paragraphs: [
        "هدف فقط نصب پنل نیست؛ ساخت مسیر درآمد پایدار از فروش برق خانگی است. بعد از راه‌اندازی، همان مزیت‌های فروش به برقینو در اختیارتان است.",
      ],
      list: [
        `خرید با نرخ بورس سبز (نمونه حدود ${valueProps.barghinoPrice} ${valueProps.priceUnit})`,
        `پرداخت تضمینی حداکثر ${valueProps.barghinoPayoutMonths} ماه`,
        "مسیر یکپارچه از نصب تا فروش",
        "پشتیبانی در مدارک و مراحل اجرایی",
      ],
    },
  ],
  faq: [
    {
      id: "f1",
      question: "چه مساحتی از پشت‌بام نیاز است؟",
      answer: "برای هر کیلووات نصب، معمولاً حدود ۸ تا ۱۰ متر مربع فضای بدون سایه لازم است.",
    },
    {
      id: "f2",
      question: "بعد از نصب، برق را به چه کسی می‌فروشم؟",
      answer:
        "می‌توانید به دولت بفروشید یا به برقینو. مسیر پیشنهادی ما فروش به برقینو با نرخ بورس سبز و پرداخت سریع‌تر است.",
    },
  ],
};

export const SUPPORT_PAGE: LandingPageContent = {
  meta: {
    title: "پاسخگوی سریع",
    description: "پشتیبانی برقینو برای فروش برق خانگی و درخواست نصب نیروگاه",
    badge: "پشتیبانی",
  },
  hero: {
    title: "پاسخگوی سریع برقینو",
    highlight: "همراه مسیر فروش و نصب",
    description:
      "برای سوالات فروش برق، وضعیت پرداخت، مدارک و درخواست نصب نیروگاه خورشیدی کنار شما هستیم.",
    image: IMAGES.landing.support,
  },
  features: [
    {
      id: "f1",
      title: "تماس تلفنی",
      description: "پاسخگویی در ساعات اداری",
      icon: "Phone",
    },
    {
      id: "f2",
      title: "تیکت پنل",
      description: "پیگیری درخواست‌ها از داشبورد کاربری",
      icon: "Headphones",
    },
    {
      id: "f3",
      title: "راهنمای مدارک",
      description: "کمک برای تکمیل مدارک فروش یا نصب",
      icon: "ShieldCheck",
    },
    {
      id: "f4",
      title: "پیگیری پرداخت",
      description: "وضعیت تسویه و زمان‌بندی پرداخت",
      icon: "Clock",
    },
  ],
  steps: [
    { id: "s1", step: 1, title: "ثبت درخواست", description: "موضوع را از تماس، فرم یا تیکت بفرستید" },
    { id: "s2", step: 2, title: "بررسی", description: "کارشناس موضوع را بررسی می‌کند" },
    { id: "s3", step: 3, title: "پاسخ", description: "راهنمایی یا اقدام بعدی اعلام می‌شود" },
  ],
  sections: [
    {
      id: "sec1",
      title: "چه موضوعاتی را پوشش می‌دهیم؟",
      paragraphs: [
        "فروش برق نیروگاه خانگی، زمان پرداخت، مدارک هویتی، و درخواست نصب نیروگاه خورشیدی از موضوعات اصلی پشتیبانی برقینو هستند.",
      ],
    },
  ],
  faq: [
    {
      id: "f1",
      question: "چطور وضعیت پرداخت را پیگیری کنم؟",
      answer: "از پنل کاربری بخش پرداخت‌ها یا با ثبت تیکت پشتیبانی می‌توانید وضعیت را پیگیری کنید.",
    },
  ],
};
