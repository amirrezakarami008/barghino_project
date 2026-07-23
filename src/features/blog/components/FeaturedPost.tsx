"use client";

import { MediaImage } from "@/shared/ui/MediaImage";
import { cn } from "@/shared/lib/utils";
import type { BlogPost } from "@/shared/types";
import { ArrowLeft, Clock } from "@/shared/lib/icons";
import Link from "next/link";

interface FeaturedPostProps {
  post: BlogPost;
  className?: string;
}

export function FeaturedPost({ post, className }: FeaturedPostProps) {
  return (
    <Link
      href={post.href}
      className={cn(
        "group relative block overflow-hidden rounded-[1.75rem] bg-surface-950 shadow-2xl shadow-slate-900/20",
        className,
      )}
    >
      <div className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[460px]">
        <MediaImage
          src={post.image ?? "/images/solar-panels.jpg"}
          alt={post.title}
          overlay="gradient"
          className="absolute inset-0"
          imageClassName="transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.18),transparent_55%)]" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200 backdrop-blur-md">
              مقاله ویژه
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
              {post.category}
            </span>
          </div>
          <h2 className="max-w-3xl font-display text-2xl font-extrabold leading-snug text-white sm:text-3xl lg:text-4xl">
            {post.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <time>{post.date}</time>
            {post.readTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime} مطالعه
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-semibold text-brand-300 transition-transform group-hover:-translate-x-1">
              مطالعه مقاله
              <ArrowLeft className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
