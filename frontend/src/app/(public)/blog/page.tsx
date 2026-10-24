import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/features/marketing/articles";
import { InfoShell, PageIntro } from "@/features/marketing/info";
import { faDigits } from "@/shared/lib/fa";

export const metadata: Metadata = { title: "مجله" };

export default function BlogPage() {
  return (
    <InfoShell>
      <PageIntro eyebrow="مجله برقینو" title="راهنمای فروش و نصب، بدون وعده اضافه" lede="نوشته‌های زیر توضیح محصول‌اند، نه خبر زنده بازار برق." />
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link href={`/blog/${article.slug}`} className="block h-full rounded-panel border border-border bg-card p-5 hover:border-primary/30">
              <p className="text-xs text-muted-foreground">{faDigits(article.minutes)} دقیقه مطالعه</p>
              <h2 className="mt-3 text-lg font-semibold text-primary">{article.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{article.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </InfoShell>
  );
}
