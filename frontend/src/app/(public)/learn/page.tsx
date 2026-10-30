import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { articles } from "@/features/marketing/articles";
import { FaqList } from "@/features/marketing/faq-list";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";

export const metadata: Metadata = {
  title: "آموزش",
  description:
    "مقالات و پرسش‌های رایج درباره فروش برق خانگی، نصب نیروگاه، قرارداد و تسویه در برقینو.",
};

export default function LearnPage() {
  return (
    <div>
      <section className="bg-grad-aurora border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <p className="text-caption font-semibold text-accent">آموزش</p>
          <h1 className="mt-2 max-w-3xl text-h1 text-balance">یاد بگیرید؛ بعد مسیر را انتخاب کنید</h1>
          <p className="mt-4 max-w-2xl text-body text-foreground-muted">
            مقالات کوتاه درباره تفاوت مسیرها، قرارداد و پرسش‌های پرتکرار. جایی که عدد آمده، نمونه است نه نرخ لحظه‌ای.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="text-h2">مقالات</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <Card variant="interactive" className="h-full">
                <Link
                  href={`/blog/${article.slug}`}
                  className="flex h-full flex-col rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="grid size-10 place-items-center rounded-md bg-volt-50 text-volt-700 dark:bg-volt-900/40 dark:text-volt-200">
                    <Icon name="book" className="size-5" />
                  </span>
                  <h3 className="mt-4 text-h4">{article.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-7 text-foreground-muted">{article.summary}</p>
                  <p className="mt-4 text-caption text-foreground-muted">
                    حدود {faNumber(article.minutes)} دقیقه مطالعه
                  </p>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-center text-h2">پرسش‌های رایج</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-body text-foreground-muted">
            قبل از ثبت‌نام، ابهام قیمت، تسویه و مدارک را اینجا روشن کنید.
          </p>
          <FaqList className="mt-8" />
        </div>
      </section>
    </div>
  );
}
