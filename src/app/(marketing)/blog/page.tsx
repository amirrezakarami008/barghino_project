import { BlogMagazine } from "@/features/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مجله برقینو",
  description: "آخرین مقالات تخصصی درباره بازار برق، بهینه‌سازی مصرف و انرژی تجدیدپذیر",
};

export default function BlogPage() {
  return <BlogMagazine />;
}
