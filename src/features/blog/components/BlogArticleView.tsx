"use client";

import { BlogPostCard } from "@/features/blog/components/BlogPostCard";
import { useBlogPost, useBlogPosts } from "@/features/blog/hooks/useBlogPosts";
import { CTASection } from "@/features/marketing/home/sections/CTASection";
import { PageBanner } from "@/features/marketing/components/PageBanner";
import { ProseContent } from "@/features/marketing/components/ProseContent";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { Section } from "@/shared/ui/Section";
import type { BlogPost } from "@/shared/types";
import { notFound } from "next/navigation";
import { useSyncExternalStore } from "react";

interface BlogArticleViewProps {
  seedPost?: BlogPost;
  slug: string;
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function BlogArticleView({ seedPost, slug }: BlogArticleViewProps) {
  const isClient = useIsClient();
  const { post: storePost } = useBlogPost(slug, { includeDrafts: false });
  const { posts } = useBlogPosts();
  const post = seedPost ?? storePost;

  if (!seedPost && !isClient) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        در حال بارگذاری مقاله...
      </div>
    );
  }

  if (!post || (post.status ?? "published") === "draft") {
    notFound();
  }

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageBanner
        image={post.image ?? "/images/solar-panels.jpg"}
        alt={post.title}
        height="min-h-[360px] lg:min-h-[480px]"
        priority
      >
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-200 backdrop-blur-sm">
          {post.category}
        </span>
        <h1 className="max-w-4xl font-display text-3xl font-extrabold text-white lg:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
          {post.author && <span>نویسنده: {post.author}</span>}
          <span>{post.date}</span>
          {post.readTime && <span>{post.readTime} مطالعه</span>}
        </div>
      </PageBanner>

      <Section>
        <Container size="narrow">
          <p className="mb-10 rounded-2xl border border-brand-100 bg-brand-50/60 px-5 py-4 text-base leading-8 text-slate-700">
            {post.excerpt}
          </p>
          <ProseContent sections={post.content} />
          <div className="mt-12 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center sm:p-8">
            <h3 className="mb-2 text-lg font-bold text-slate-900">نیاز به مشاوره دارید؟</h3>
            <p className="mb-6 text-sm text-slate-600">
              کارشناسان برقینو آماده پاسخگویی به سوالات شما هستند.
            </p>
            <Button href="/contact" className="group">
              تماس با ما
              <LinkArrow />
            </Button>
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section background="muted">
          <Container>
            <h2 className="mb-8 font-display text-2xl font-bold text-slate-900">مقالات مرتبط</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogPostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CTASection />
    </>
  );
}
