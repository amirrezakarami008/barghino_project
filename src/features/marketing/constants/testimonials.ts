import type { TestimonialItem } from "@/shared/types";
import { IMAGES } from "@/shared/constants/images";

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "1",
    name: "علی زمانی",
    role: "مدیر تولید، صنعت فولاد",
    content:
      "با همکاری برق ما در تامین برق صنعتی، از کیفیت خدمات، تعهد کاری و دقت فنی تیم اجرایی رضایت کامل داریم.",
    rating: 5,
    avatar: IMAGES.testimonials[0],
  },
  {
    id: "2",
    name: "سارا قربانی",
    role: "مدیرعامل، مجموعه تجاری",
    content:
      "بدون تردید در پروژه‌های آینده نیز از خدمات حرفه‌ای این مجموعه بهره خواهیم برد.",
    rating: 5,
    avatar: IMAGES.testimonials[1],
  },
  {
    id: "3",
    name: "محمد میرعلمی",
    role: "مدیر فنی، کارخانه تولیدی",
    content:
      "کیفیت کار و پشتیبانی ۲۴ ساعته، این شرکت را به گزینه‌ای مطمئن برای پروژه‌های بزرگ تبدیل کرده است.",
    rating: 5,
    avatar: IMAGES.testimonials[2],
  },
  {
    id: "4",
    name: "فاطمه کاظمی",
    role: "مالک واحد مسکونی",
    content:
      "از برخورد محترمانه و وقت‌شناسی این مجموعه بسیار راضی هستیم. بدون تردید به دیگران نیز توصیه می‌کنم.",
    rating: 5,
    avatar: IMAGES.testimonials[3],
  },
];
