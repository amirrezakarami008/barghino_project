import type { TestimonialItem } from "@/shared/types";
import { IMAGES } from "@/shared/constants/images";

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "t1",
    name: "رضا محمدی",
    role: "دارنده نیروگاه خانگی",
    content:
      "قبلاً برق را با نرخ پایه می‌فروختم و ماه‌ها منتظر پول می‌ماندم. با برقینو هم نرخ بهتر گرفتم هم تسویه زودتر انجام شد.",
    rating: 5,
    avatar: IMAGES.testimonials[0],
  },
  {
    id: "t2",
    name: "سارا احمدی",
    role: "متقاضی نصب نیروگاه",
    content:
      "نیروگاه نداشتم؛ درخواست نصب دادم و مسیر از بازدید تا پیشنهاد برایم شفاف بود. هدفم بعد از نصب، فروش به برقینو است.",
    rating: 5,
    avatar: IMAGES.testimonials[1],
  },
  {
    id: "t3",
    name: "امیر حسینی",
    role: "مشترک خانگی",
    content:
      "مهم‌ترین چیز برای من وجود قرارداد رسمی بود. مقایسه با مسیر پایه همان چیزی بود که تصمیمم را قطعی کرد.",
    rating: 5,
    avatar: IMAGES.testimonials[2],
  },
];
