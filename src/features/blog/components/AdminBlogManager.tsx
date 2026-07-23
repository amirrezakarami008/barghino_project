"use client";

import { useBlogPosts } from "@/features/blog/hooks/useBlogPosts";
import { deleteCustomPost } from "@/features/blog/lib/store";
import { DashboardPage, EmptyState, Panel } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { Button } from "@/shared/ui/Button";
import { MediaImage } from "@/shared/ui/MediaImage";
import type { BlogPost } from "@/shared/types";
import { cn } from "@/shared/lib/utils";
import { useMemo, useState } from "react";

type Tab = "all" | "published" | "draft" | "custom";

export function AdminBlogManager() {
  const { posts } = useBlogPosts({ includeDrafts: true });
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const published = posts.filter((p) => (p.status ?? "published") === "published").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const custom = posts.filter((p) => p.source === "custom").length;
    return { total: posts.length, published, drafts, custom };
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (tab === "published" && (post.status ?? "published") !== "published") return false;
      if (tab === "draft" && post.status !== "draft") return false;
      if (tab === "custom" && post.source !== "custom") return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q)
      );
    });
  }, [posts, tab, query]);

  const handleDelete = (post: BlogPost) => {
    if (post.source !== "custom") return;
    if (!window.confirm(`مقاله «${post.title}» حذف شود؟`)) return;
    deleteCustomPost(post.id);
  };

  if (!DASHBOARD_USER.isAdmin) {
    return (
      <DashboardPage title="مدیریت مجله" subtitle="دسترسی محدود">
        <EmptyState
          title="دسترسی ادمین لازم است"
          description="این بخش فقط برای مدیران سامانه در دسترس است."
          action={<Button href="/dashboard">بازگشت به داشبورد</Button>}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="مدیریت مجله"
      subtitle="انتشار، پیش‌نویس و مدیریت مقالات تخصصی برق ما"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "کل مقالات", value: stats.total, tone: "text-slate-900" },
          { label: "منتشرشده", value: stats.published, tone: "text-emerald-600" },
          { label: "پیش‌نویس", value: stats.drafts, tone: "text-amber-600" },
          { label: "ایجادشده توسط ادمین", value: stats.custom, tone: "text-brand-600" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={cn("mt-1 font-display text-3xl font-extrabold", item.tone)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "همه"],
              ["published", "منتشرشده"],
              ["draft", "پیش‌نویس"],
              ["custom", "ادمین"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Button href="/dashboard/blog/new">+ مقاله جدید</Button>
      </div>

      <Panel className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در عنوان، دسته یا اسلاگ..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:max-w-sm"
          />
          <Button href="/blog" variant="outline" size="sm">
            مشاهده مجله عمومی
          </Button>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState
          title="مقاله‌ای در این فیلتر نیست"
          description="یک مقاله جدید بنویسید یا فیلتر را تغییر دهید."
          action={<Button href="/dashboard/blog/new">نوشتن مقاله</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:p-5">
                <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-44">
                  <MediaImage
                    src={post.image ?? "/images/solar-panels.jpg"}
                    alt={post.title}
                    className="absolute inset-0 h-full min-h-36"
                    sizes="180px"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusPill
                        label={(post.status ?? "published") === "published" ? "منتشرشده" : "پیش‌نویس"}
                        tone={(post.status ?? "published") === "published" ? "success" : "warning"}
                      />
                      <StatusPill
                        label={post.source === "custom" ? "ادمین" : "سیستمی"}
                        tone={post.source === "custom" ? "brand" : "muted"}
                      />
                      {post.featured && <StatusPill label="ویژه" tone="accent" />}
                      <span className="text-xs text-slate-400">{post.category}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{post.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-slate-600 line-clamp-2">{post.excerpt}</p>
                    <p className="mt-2 text-xs text-slate-400" dir="ltr">
                      /blog/{post.slug} · {post.date}
                      {post.readTime ? ` · ${post.readTime}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(post.status ?? "published") === "published" && (
                      <Button href={post.href} size="sm" variant="outline">
                        مشاهده
                      </Button>
                    )}
                    {post.source === "custom" ? (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(post)}>
                        حذف
                      </Button>
                    ) : (
                      <span className="self-center text-xs text-slate-400">
                        مقالات سیستمی قابل حذف نیستند
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardPage>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "brand" | "accent" | "muted";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    brand: "bg-brand-50 text-brand-700 ring-brand-100",
    accent: "bg-orange-50 text-orange-700 ring-orange-100",
    muted: "bg-slate-50 text-slate-500 ring-slate-100",
  };

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", styles[tone])}>
      {label}
    </span>
  );
}
