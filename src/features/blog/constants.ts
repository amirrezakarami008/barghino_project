import { IMAGES } from "@/shared/constants/images";

export const BLOG_STORAGE_KEY = "barghma-blog-posts-v1";

export const BLOG_CATEGORY_OPTIONS = [
  "انرژی خورشیدی",
  "راهنما",
  "بازار برق",
  "نیروگاه خانگی",
] as const;

export type BlogCategoryOption = (typeof BLOG_CATEGORY_OPTIONS)[number];

export const BLOG_COVER_PRESETS = [
  { id: "solar", label: "پنل خورشیدی", src: IMAGES.stats },
  { id: "plant", label: "نیروگاه خانگی", src: IMAGES.whyUs },
  { id: "lightning", label: "برق و انرژی", src: IMAGES.cta },
  { id: "farm", label: "مزرعه خورشیدی", src: IMAGES.services.renewable },
  { id: "rooftop", label: "پشت‌بام", src: IMAGES.blog["solar-system"] },
] as const;

export const BLOG_FILTER_CATEGORIES = ["همه", ...BLOG_CATEGORY_OPTIONS] as const;
