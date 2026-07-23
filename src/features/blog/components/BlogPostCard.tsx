"use client";

import { ImageCard } from "@/shared/ui/MediaImage";
import { cn } from "@/shared/lib/utils";
import type { BlogPost } from "@/shared/types";
import { ArrowLeft, Clock } from "@/shared/lib/icons";
import Link from "next/link";

interface BlogPostCardProps {
  post: BlogPost;
  className?: string;
}

export function BlogPostCard({ post, className }: BlogPostCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10",
        className,
      )}
    >
      <Link href={post.href} className="block">
        <ImageCard
          src={post.image ?? "/images/solar-panels.jpg"}
          alt={post.title}
          height="h-48"
          overlay="gradient"
        >
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
              {post.category}
            </span>
            {post.featured && (
              <span className="rounded-full bg-accent-500/95 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                ویژه
              </span>
            )}
          </div>
        </ImageCard>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <time className="font-medium text-brand-600">{post.date}</time>
          {post.readTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          )}
        </div>
        <h3 className="mb-2 font-display text-lg font-bold leading-8 text-slate-900 transition-colors group-hover:text-brand-600">
          <Link href={post.href}>{post.title}</Link>
        </h3>
        <p className="mb-5 flex-1 text-sm leading-7 text-slate-600 line-clamp-3">{post.excerpt}</p>
        <Link
          href={post.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-all hover:gap-2.5 hover:text-brand-700"
        >
          ادامه مطلب
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
