import { CTASection } from "@/features/marketing/home/sections/CTASection";
import { PageBanner } from "@/features/marketing/components/PageBanner";
import { ProseContent } from "@/features/marketing/components/ProseContent";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { BlogCard } from "@/shared/ui/Interactive";
import { Section } from "@/shared/ui/Section";
import { BLOG_POSTS, getAllBlogSlugs, getBlogPostBySlug, getBlogImage } from "@/features/marketing/constants";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "مقاله یافت نشد" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <PageBanner
        image={post.image ?? getBlogImage(post.slug)}
        alt={post.title}
        height="min-h-[360px] lg:min-h-[480px]"
      >
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-200 backdrop-blur-sm">
          {post.category}
        </span>
        <h1 className="max-w-4xl text-3xl font-bold text-white lg:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
          <span>نویسنده: {post.author}</span>
          <span>{post.date}</span>
          {post.readTime && <span>{post.readTime} مطالعه</span>}
        </div>
      </PageBanner>

      <Section>
        <Container size="narrow">
          <ProseContent sections={post.content} />
          <div className="mt-12 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center sm:p-8">
            <h3 className="mb-2 text-lg font-bold text-slate-900">نیاز به مشاوره دارید؟</h3>
            <p className="mb-6 text-sm text-slate-600">
              کارشناسان برق ما آماده پاسخگویی به سوالات شما هستند.
            </p>
            <Button href="/contact" className="group">
              تماس با ما
              <LinkArrow />
            </Button>
          </div>
        </Container>
      </Section>

      <Section background="muted">
        <Container>
          <h2 className="mb-8 text-2xl font-bold text-slate-900">مقالات مرتبط</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((p) => (
              <BlogCard key={p.id} {...p} />
            ))}
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
