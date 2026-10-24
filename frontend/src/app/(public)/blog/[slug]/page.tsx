import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/features/marketing/articles";
import { InfoShell } from "@/features/marketing/info";
import { faDigits } from "@/shared/lib/fa";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle((await params).slug);
  return { title: article?.title ?? "مجله" };
}

export default async function ArticlePage({ params }: Props) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  return (
    <InfoShell>
      <article className="mx-auto max-w-3xl">
        <p className="text-sm text-emerald">{faDigits(article.minutes)} دقیقه مطالعه</p>
        <h1 className="mt-2 text-3xl leading-[1.5] font-bold text-primary">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{article.summary}</p>
        <div className="mt-8 grid gap-4">
          {article.body.map((paragraph) => (
            <p key={paragraph} className="leading-8">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </InfoShell>
  );
}
