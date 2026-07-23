"use client";

import { BlogFilters } from "@/features/blog/components/BlogFilters";
import { BlogPostCard } from "@/features/blog/components/BlogPostCard";
import { FeaturedPost } from "@/features/blog/components/FeaturedPost";
import { useBlogPosts } from "@/features/blog/hooks/useBlogPosts";
import { CTASection } from "@/features/marketing/home/sections/CTASection";
import { PageBanner } from "@/features/marketing/components/PageBanner";
import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import { IMAGES } from "@/shared/constants/images";
import { useMemo, useState } from "react";

export function BlogMagazine() {
  const { posts } = useBlogPosts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("همه");

  const featured = useMemo(
    () => posts.find((p) => p.featured) ?? posts[0],
    [posts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (featured && post.id === featured.id) return false;
      if (category !== "همه" && post.category !== category) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
      );
    });
  }, [posts, query, category, featured]);

  const showFeatured =
    featured &&
    (category === "همه" || featured.category === category) &&
    (!query.trim() ||
      featured.title.toLowerCase().includes(query.trim().toLowerCase()) ||
      featured.excerpt.toLowerCase().includes(query.trim().toLowerCase()));

  const resultCount = filtered.length + (showFeatured ? 1 : 0);

  return (
    <>
      <PageBanner image={IMAGES.stats} alt="مجله برق ما" priority>
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-200 backdrop-blur-sm">
          مجله تخصصی انرژی
        </span>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
          مجله <span className="text-brand-200">برق ما</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
          تحلیل بازار برق، بهینه‌سازی مصرف و انرژی تجدیدپذیر — نوشته‌شده برای تصمیم‌گیرندگان
          و تیم‌های فنی.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
            {posts.length} مقاله منتشرشده
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
            به‌روزرسانی مستمر
          </span>
        </div>
      </PageBanner>

      <Section>
        <Container>
          <BlogFilters
            query={query}
            category={category}
            onQueryChange={setQuery}
            onCategoryChange={setCategory}
            resultCount={resultCount}
          />

          {showFeatured && (
            <div className="mt-8">
              <FeaturedPost post={featured} />
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-[fade-up_0.5s_ease-out_forwards] opacity-0"
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                >
                  <BlogPostCard post={post} />
                </div>
              ))}
            </div>
          ) : !showFeatured ? (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center">
              <h3 className="font-display text-lg font-bold text-slate-900">مقاله‌ای پیدا نشد</h3>
              <p className="mt-2 text-sm text-slate-500">عبارت یا دسته‌بندی دیگری را امتحان کنید.</p>
            </div>
          ) : null}
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
