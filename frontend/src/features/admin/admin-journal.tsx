"use client";

import Link from "next/link";
import { useId, useState, type ReactElement } from "react";
import { faDigits } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { AdminPage } from "./admin-page";

type JournalArticle = { readonly slug: string; readonly title: string; readonly summary: string; readonly minutes: number };

export function AdminJournal({ articles }: { readonly articles: readonly JournalArticle[] }): ReactElement {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizePersian(query);
  const filteredArticles = articles.filter((article) => normalizePersian(`${article.title} ${article.summary}`).includes(normalizedQuery));
  const rows = filteredArticles.map((article) => (
    <tr key={article.slug}>
      <td><div className="admin-article-cell"><span className="admin-icon-tile"><Icon name="file" /></span><div><Link href={`/blog/${article.slug}`} className="admin-article-title">{article.title}</Link><p>{article.summary}</p></div></div></td>
      <td><span className="admin-published-badge"><span className="admin-status-dot" />منتشرشده</span></td>
      <td className="admin-reading-time">{faDigits(article.minutes)} دقیقه</td>
      <td><Link href={`/blog/${article.slug}`} className="admin-row-link" aria-label={`مشاهده مطلب: ${article.title}`}><Icon name="eye" /><span>مشاهده</span></Link></td>
    </tr>
  ));

  return (
    <AdminPage title="مجله و راهنماها" description="مطالب منتشرشده را پیدا کنید و نسخهٔ قابل مشاهده در سایت را ببینید." action={{ href: "/blog", label: "مشاهده مجله در سایت", icon: "eye" }}>
      <section className="admin-surface admin-journal">
        <div className="admin-section-heading admin-journal-heading"><div><h2>کتابخانهٔ محتوا <span className="admin-count-badge">{faDigits(articles.length)}</span></h2><p>راهنماهای نصب، قرارداد و فروش برق</p></div><span className="admin-published-badge"><Icon name="check" />منتشرشده در سایت</span></div>
        <div className="admin-journal-tools"><label className="admin-search-field" htmlFor={searchId}><span className="sr-only">جست‌وجو در مطالب مجله</span><Icon name="search" /><input id={searchId} type="search" placeholder="جست‌وجو در عنوان و توضیحات مطالب…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span role="status">{faDigits(filteredArticles.length)} مطلب</span></div>
        <div className="admin-table-scroll" role="region" aria-label="مطالب مجله" tabIndex={0}><table className="admin-table"><caption className="sr-only">مطالب منتشرشدهٔ برقینو</caption><thead><tr><th scope="col">عنوان مطلب</th><th scope="col">وضعیت انتشار</th><th scope="col">زمان مطالعه</th><th scope="col"><span className="sr-only">مشاهده مطلب</span></th></tr></thead><tbody>{rows.length ? rows : <tr><td colSpan={4}><div className="admin-empty-state"><span className="admin-icon-tile"><Icon name="search" /></span><h3>مطلبی با این عبارت پیدا نشد</h3><p>عنوان یا موضوع دیگری را امتحان کنید.</p><button type="button" className="admin-button admin-button-secondary" onClick={() => setQuery("")}>پاک کردن جست‌وجو</button></div></td></tr>}</tbody></table></div>
        <div className="admin-table-footer"><Icon name="file" /><p>این فهرست شامل راهنماهای فعلی سایت است. امکان ویرایش و انتشار از این بخش هنوز فعال نیست.</p></div>
      </section>
    </AdminPage>
  );
}

function normalizePersian(value: string): string {
  return value.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\u200c\u064b-\u065f]/g, "").trim().toLocaleLowerCase("fa");
}
