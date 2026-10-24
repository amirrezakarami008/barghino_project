import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/features/marketing/articles";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "مجله" };

export default function JournalPage() {
  return (
    <WorkspacePage icon="file" title="مجله" lede="راهنماهای ثابت سایت اینجاست. انتشار و پیش‌نویس جدا، بعد از اتصال سرویس محتوا اضافه می‌شود.">
      <ul className="grid gap-3">
        {articles.map((article) => (
          <li key={article.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-4">
            <div>
              <p className="font-semibold">{article.title}</p>
              <p className="text-xs text-muted-foreground">منتشرشده در سایت</p>
            </div>
            <Link href={`/blog/${article.slug}`} className="text-sm font-semibold text-primary">
              دیدن
            </Link>
          </li>
        ))}
      </ul>
    </WorkspacePage>
  );
}
