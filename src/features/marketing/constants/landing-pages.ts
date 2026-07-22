import type { LandingPageContent } from "@/shared/types";
import { IMAGES } from "@/shared/constants/images";

export const SOLAR_HOME_PAGE: LandingPageContent = {
  meta: {
    title: "نیروگاه خورشیدی خانگی",
    description: "طراحی و اجرای نیروگاه خورشیدی خانگی با مشاوره رایگان برق ما",
    badge: "انرژی پاک",
  },
  hero: {
    title: "نیروگاه خورشیدی خانگی",
    highlight: "برق رایگان از خورشید",
    description:
      "با نصب پنل خورشیدی روی پشت‌بام، برق مورد نیاز خانه یا ویلای خود را تولید کنید و از یارانه و تسهیلات بهره‌مند شوید.",
    image: IMAGES.landing.solar,
  },
  features: [
    {
      id: "f1",
      title: "مشاوره رایگان",
      description: "بررسی پتانسیل پشت‌بام و برآورد تولید برق",
      icon: "Lightbulb",
    },
    {
      id: "f2",
      title: "تجهیزات معتبر",
      description: "پنل و اینverter با گارانتی بین‌المللی",
      icon: "Sun",
    },
    {
      id: "f3",
      title: "نصب استاندارد",
      description: "اجرا توسط تیم مجرب با استاندارد ملی",
      icon: "ShieldCheck",
    },
    {
      id: "f4",
      title: "اتصال به شبکه",
      description: "فروش برق مازاد به شبکه سراسری",
      icon: "Plug",
    },
  ],
  steps: [
    { id: "s1", step: 1, title: "مشاوره", description: "بررسی فنی و اقتصادی پروژه" },
    { id: "s2", step: 2, title: "طراحی", description: "طراحی سیستم متناسب با مصرف" },
    { id: "s3", step: 3, title: "نصب", description: "نصب پنل و اتصال به شبکه" },
    { id: "s4", step: 4, title: "بهره‌برداری", description: "راه‌اندازی و آموزش کاربری" },
  ],
  sections: [
    {
      id: "sec1",
      title: "مزایای نیروگاه خانگی",
      paragraphs: [
        "تولید برق پاک، کاهش قبض، استقلال انرژی و امکان فروش برق مازاد از مزایای کلیدی نیروگاه خورشیدی خانگی است.",
      ],
      list: [
        "کاهش ۵۰ تا ۹۰ درصد قبض برق",
        "افزایش ارزش ملک",
        "دوستدار محیط زیست",
        "بازگشت سرمایه ۴ تا ۶ سال",
      ],
    },
  ],
  faq: [
    {
      id: "f1",
      question: "چه مساحتی از پشت‌بام نیاز است؟",
      answer: "برای هر کیلووات نصب، حدود ۸ تا ۱۰ متر مربع فضای بدون سایه لازم است.",
    },
  ],
};

export const SUPPORT_PAGE: LandingPageContent = {
  meta: {
    title: "پاسخگوی سریع",
    description: "پشتیبانی ۲۴ ساعته برق ما — تماس، چت و تیکت",
    badge: "پشتیبانی",
  },
  hero: {
    title: "پاسخگوی سریع برق ما",
    highlight: "۲۴ ساعته، ۷ روز هفته",
    description:
      "تیم پشتیبانی تخصصی برق ما در تمام مراحل خرید، عقد قرارداد و مدیریت مصرف همراه شماست.",
    image: IMAGES.landing.support,
  },
  features: [
    {
      id: "f1",
      title: "تماس تلفنی",
      description: "پاسخگویی در ساعات اداری و اورژانس",
      icon: "Headphones",
    },
    {
      id: "f2",
      title: "تیکت آنلاین",
      description: "ثبت درخواست و پیگیری از پنل کاربری",
      icon: "LayoutDashboard",
    },
    {
      id: "f3",
      title: "مشاوره فوری",
      description: "ارتباط مستقیم با کارشناس انرژی",
      icon: "Lightbulb",
    },
    {
      id: "f4",
      title: "راهنمای آنلاین",
      description: "دسترسی به FAQ و آموزش‌های ویدیویی",
      icon: "ShieldCheck",
    },
  ],
  steps: [],
  sections: [
    {
      id: "sec1",
      title: "زمان پاسخگویی",
      paragraphs: [
        "درخواست‌های عادی ظرف ۲۴ ساعت و موارد فوری ظرف ۲ ساعت پاسخ داده می‌شوند.",
      ],
    },
  ],
  faq: [],
};
