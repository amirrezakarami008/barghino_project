"use client";

import { BLOG_CATEGORY_OPTIONS, BLOG_COVER_PRESETS } from "@/features/blog/constants";
import { estimateReadTime, formatPersianDate, slugifyTitle } from "@/features/blog/lib/format";
import { isSlugTaken, saveCustomPost } from "@/features/blog/lib/store";
import { Button } from "@/shared/ui/Button";
import { MediaImage } from "@/shared/ui/MediaImage";
import { cn } from "@/shared/lib/utils";
import type { BlogPost, BlogPostStatus, ContentSection } from "@/shared/types";
import { Check, Sparkles, X } from "@/shared/lib/icons";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

interface DraftSection {
  id: string;
  title: string;
  body: string;
  listText: string;
}

function createSection(): DraftSection {
  return {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    body: "",
    listText: "",
  };
}

export function BlogEditorForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<string>(BLOG_CATEGORY_OPTIONS[0]);
  const [author, setAuthor] = useState("تیم تحریریه برقینو");
  const [cover, setCover] = useState(BLOG_COVER_PRESETS[0].src);
  const [featured, setFeatured] = useState(false);
  const [sections, setSections] = useState<DraftSection[]>([createSection()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedPost, setSavedPost] = useState<BlogPost | null>(null);

  const paragraphCount = useMemo(
    () =>
      sections.reduce((sum, section) => {
        const paras = section.body
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean).length;
        return sum + paras;
      }, 0),
    [sections],
  );

  const listCount = useMemo(
    () =>
      sections.reduce(
        (sum, section) =>
          sum +
          section.listText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean).length,
        0,
      ),
    [sections],
  );

  const readTime = estimateReadTime(Math.max(paragraphCount, 1), listCount);

  const updateSection = (id: string, patch: Partial<DraftSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugifyTitle(value));
  };

  const buildContent = (): ContentSection[] =>
    sections
      .filter((s) => s.title.trim() || s.body.trim())
      .map((s) => ({
        id: s.id,
        title: s.title.trim() || "بخش",
        paragraphs: s.body
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean),
        list: s.listText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      }))
      .map((s) => ({
        ...s,
        list: s.list.length ? s.list : undefined,
        paragraphs: s.paragraphs.length ? s.paragraphs : [" "],
      }));

  const persist = (status: BlogPostStatus) => {
    setError(null);

    if (!title.trim()) {
      setError("عنوان مقاله الزامی است.");
      return;
    }
    if (!excerpt.trim()) {
      setError("خلاصه مقاله را وارد کنید.");
      return;
    }
    if (!slug.trim()) {
      setError("اسلاگ (آدرس) مقاله الزامی است.");
      return;
    }
    if (isSlugTaken(slug.trim())) {
      setError("این اسلاگ قبلاً استفاده شده است. یک آدرس یکتا انتخاب کنید.");
      return;
    }

    const content = buildContent();
    if (!content.length) {
      setError("حداقل یک بخش محتوا اضافه کنید.");
      return;
    }

    setSaving(true);
    const id = `custom-${Date.now()}`;
    const post: BlogPost = {
      id,
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      date: formatPersianDate(),
      href: `/blog/${slug.trim()}`,
      category,
      image: cover,
      author: author.trim() || "برقینو",
      readTime,
      content,
      status,
      featured,
      source: "custom",
    };

    saveCustomPost(post);
    setSavedPost(post);
    setSaving(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    persist("published");
  };

  if (savedPost) {
    return (
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          {savedPost.status === "draft" ? "پیش‌نویس ذخیره شد" : "مقاله منتشر شد"}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          «{savedPost.title}» با موفقیت ثبت شد
          {savedPost.status === "published" ? " و در مجله عمومی قابل مشاهده است." : "."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {savedPost.status === "published" && (
            <Button href={savedPost.href}>مشاهده در مجله</Button>
          )}
          <Button variant="outline" href="/dashboard/blog">
            بازگشت به مدیریت بلاگ
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSavedPost(null);
              setTitle("");
              setSlug("");
              setSlugTouched(false);
              setExcerpt("");
              setSections([createSection()]);
              setFeatured(false);
            }}
          >
            نوشتن مقاله بعدی
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <h2 className="font-display text-base font-bold text-slate-900">اطلاعات اصلی</h2>
          </div>

          <div className="space-y-4">
            <Field label="عنوان مقاله" required>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="مثلاً: پنج راهکار کاهش هزینه برق صنایع"
                className={fieldClass}
                required
              />
            </Field>

            <Field
              label="آدرس مقاله (اسلاگ)"
              hint={`نمایش: /blog/${slug || "…"}`}
              required
            >
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.replace(/\s+/g, "-"));
                }}
                dir="ltr"
                className={cn(fieldClass, "font-mono text-left")}
                required
              />
            </Field>

            <Field label="خلاصه کوتاه" required>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="یک جمله جذاب برای کارت مقاله و نتایج جستجو..."
                className={cn(fieldClass, "resize-none")}
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="دسته‌بندی">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={fieldClass}
                >
                  {BLOG_CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="نویسنده">
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-slate-700">
                نمایش به‌عنوان مقاله ویژه در صفحه مجله
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-slate-900">محتوای مقاله</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSections((prev) => [...prev, createSection()])}
            >
              + بخش جدید
            </Button>
          </div>

          <div className="space-y-5">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold tracking-wide text-slate-400">
                    بخش {index + 1}
                  </p>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSections((prev) => prev.filter((s) => s.id !== section.id))}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-red-500"
                      aria-label="حذف بخش"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    placeholder="عنوان بخش"
                    className={fieldClass}
                  />
                  <textarea
                    value={section.body}
                    onChange={(e) => updateSection(section.id, { body: e.target.value })}
                    rows={5}
                    placeholder="متن بخش — هر پاراگراف را در خط جدا بنویسید"
                    className={cn(fieldClass, "resize-y")}
                  />
                  <textarea
                    value={section.listText}
                    onChange={(e) => updateSection(section.id, { listText: e.target.value })}
                    rows={3}
                    placeholder="آیتم‌های لیست (اختیاری) — هر مورد در یک خط"
                    className={cn(fieldClass, "resize-y")}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            انتشار مقاله
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => persist("draft")}
          >
            ذخیره پیش‌نویس
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/blog")}>
            انصراف
          </Button>
        </div>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-display text-base font-bold text-slate-900">تصویر کاور</h2>
          <div className="grid grid-cols-2 gap-3">
            {BLOG_COVER_PRESETS.map((preset) => {
              const active = cover === preset.src;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCover(preset.src)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl ring-2 transition",
                    active ? "ring-brand-500" : "ring-transparent hover:ring-brand-200",
                  )}
                >
                  <div className="relative aspect-[4/3]">
                    <MediaImage
                      src={preset.src}
                      alt={preset.label}
                      className="absolute inset-0"
                      sizes="200px"
                    />
                  </div>
                  <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-2 py-1.5 text-[11px] font-medium text-white">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-display text-base font-bold text-slate-900">پیش‌نمایش کارت</h2>
            <p className="mt-1 text-xs text-slate-500">زمان مطالعه تقریبی: {readTime}</p>
          </div>
          <div className="relative h-40">
            <MediaImage src={cover} alt={title || "کاور"} className="absolute inset-0" sizes="400px" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
            <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
              {category}
            </span>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-brand-600">{formatPersianDate()}</p>
            <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
              {title || "عنوان مقاله شما"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 line-clamp-3">
              {excerpt || "خلاصه مقاله اینجا نمایش داده می‌شود."}
            </p>
          </div>
        </section>
      </aside>
    </form>
  );
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-400" dir="ltr">{hint}</p>}
    </div>
  );
}
