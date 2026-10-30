"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";
import { Button, DataTable, EmptyState, Input, type DataTableColumn } from "@/components/ui";
import { faNumber } from "@/shared/lib/fa";
import { AdminAuditLine, AdminPage, AdminSolidSurface } from "./admin-page";

type JournalArticle = {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly minutes: number;
};

export function AdminJournal({
  articles,
}: {
  readonly articles: readonly JournalArticle[];
}): ReactElement {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizePersian(query);
  const filtered = articles.filter((article) =>
    normalizePersian(`${article.title} ${article.summary}`).includes(normalizedQuery),
  );

  const columns: DataTableColumn<JournalArticle>[] = [
    {
      id: "title",
      header: "عنوان",
      mobilePrimary: true,
      cell: (row) => (
        <div className="space-y-1">
          <Link href={`/blog/${row.slug}`} className="font-semibold hover:underline">
            {row.title}
          </Link>
          <p className="text-caption text-foreground-muted line-clamp-2">{row.summary}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "وضعیت",
      cell: () => <span className="text-sm">منتشرشده · فقط‌خواندنی</span>,
    },
    {
      id: "minutes",
      header: "مطالعه",
      cell: (row) => <span>{faNumber(row.minutes)} دقیقه</span>,
    },
    {
      id: "audit",
      header: "آخرین اقدام",
      cell: () => <AdminAuditLine text="آخرین اقدام: انتشار در مجلهٔ عمومی سایت" />,
    },
  ];

  return (
    <AdminPage
      title="راهنماها"
      description="فهرست فقط‌خواندنی راهنماهای منتشرشده در سایت. ویرایش از این بخش هنوز فعال نیست."
      action={{ href: "/blog", label: "مشاهده در سایت", icon: "eye" }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <Input
          className="sm:max-w-sm"
          label="جست‌وجو در راهنماها"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جست‌وجو در عنوان و توضیحات…"
        />
        <span className="text-sm text-foreground-muted" role="status">
          {faNumber(filtered.length)} از {faNumber(articles.length)} راهنما
        </span>
      </div>

      <AdminSolidSurface className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="راهنمایی با این عبارت پیدا نشد"
            description="عنوان یا موضوع دیگری را امتحان کنید."
            icon="search"
            action={
              <Button variant="secondary" onClick={() => setQuery("")}>
                پاک کردن جست‌وجو
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(row) => row.slug}
            emptyTitle="راهنمایی نیست"
          />
        )}
      </AdminSolidSurface>
    </AdminPage>
  );
}

function normalizePersian(value: string): string {
  return value
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u064b-\u065f]/g, "")
    .trim()
    .toLocaleLowerCase("fa");
}
