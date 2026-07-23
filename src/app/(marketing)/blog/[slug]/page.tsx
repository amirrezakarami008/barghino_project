import { BlogArticleView } from "@/features/blog";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/features/marketing/constants";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "مقاله" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const seedPost = getBlogPostBySlug(slug);

  return <BlogArticleView slug={slug} seedPost={seedPost} />;
}
