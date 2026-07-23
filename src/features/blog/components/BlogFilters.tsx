"use client";

import { BLOG_FILTER_CATEGORIES } from "@/features/blog/constants";
import { cn } from "@/shared/lib/utils";

interface BlogFiltersProps {
  query: string;
  category: string;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  resultCount: number;
}

export function BlogFilters({
  query,
  category,
  onQueryChange,
  onCategoryChange,
  resultCount,
}: BlogFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="جستجو در عنوان، خلاصه یا دسته‌بندی..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            aria-label="جستجوی مقالات"
          />
        </div>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{resultCount}</span> مقاله
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {BLOG_FILTER_CATEGORIES.map((item) => {
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onCategoryChange(item)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                active
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-700",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
