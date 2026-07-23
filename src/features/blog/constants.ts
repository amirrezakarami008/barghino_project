import { IMAGES } from "@/shared/constants/images";

export const BLOG_STORAGE_KEY = "barghma-blog-posts-v1";

export const BLOG_CATEGORY_OPTIONS = [
  "بهینه‌سازی",
  "صنعت",
  "تجدیدپذیر",
  "بازار برق",
  "راهنما",
] as const;

export type BlogCategoryOption = (typeof BLOG_CATEGORY_OPTIONS)[number];

export const BLOG_COVER_PRESETS = [
  { id: "solar", label: "پنل خورشیدی", src: IMAGES.stats },
  { id: "industrial", label: "صنعت", src: IMAGES.services.optimization },
  { id: "hvac", label: "تاسیسات", src: IMAGES.landing.cooler },
  { id: "wind", label: "انرژی بادی", src: IMAGES.blog["industrial-solar"] },
  { id: "lightning", label: "برق و انرژی", src: IMAGES.cta },
  { id: "plant", label: "نیروگاه", src: IMAGES.whyUs },
  { id: "farm", label: "مزرعه خورشیدی", src: IMAGES.services.renewable },
  { id: "consulting", label: "مشاوره", src: IMAGES.services["energy-consulting"] },
] as const;

export const BLOG_FILTER_CATEGORIES = ["همه", ...BLOG_CATEGORY_OPTIONS] as const;
