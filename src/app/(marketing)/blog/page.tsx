import { CTASection } from "@/components/sections/CTASection";
import { PageBanner } from "@/components/pages/PageBanner";
import { Container } from "@/components/ui/Container";
import { BlogCard } from "@/components/ui/Interactive";
import { Section } from "@/components/ui/Section";
import { BLOG_POSTS, IMAGES } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مجله برق ما",
  description: "آخرین مقالات تخصصی درباره بازار برق، بهینه‌سازی مصرف و انرژی تجدیدپذیر",
};

export default function BlogPage() {
  return (
    <>
      <PageBanner image={IMAGES.stats} alt="مجله برق ما">
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-200 backdrop-blur-sm">
          مجله
        </span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          مجله <span className="text-brand-200">برق ما</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">
          آخرین روندها، سیاست‌ها و راهکارهای نوین بازار برق ایران
        </p>
      </PageBanner>

      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {BLOG_POSTS.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
