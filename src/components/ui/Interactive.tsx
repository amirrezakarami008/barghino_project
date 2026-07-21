"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "@/lib/icons";
import { Avatar, ImageCard } from "@/components/ui/MediaImage";
import { IMAGES } from "@/lib/constants";
import { useState, type ReactNode } from "react";

interface AccordionItemProps {
  id: string;
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle: (id: string) => void;
}

export function AccordionItem({
  id,
  question,
  answer,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition-all duration-300",
        isOpen
          ? "border-brand-200 shadow-lg shadow-brand-500/8"
          : "border-slate-200/60 hover:border-brand-200/60",
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-4 p-5 text-start sm:p-6"
        aria-expanded={isOpen}
      >
        <span className="font-display text-base font-bold text-slate-900 lg:text-lg">{question}</span>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
            isOpen ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600",
          )}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")}
          />
        </div>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-600 sm:px-6 sm:pb-6 lg:text-base">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: { id: string; question: string; answer: string }[];
}

export function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const handleToggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          {...item}
          isOpen={openId === item.id}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}

interface StarRatingProps {
  rating: number;
  max?: number;
}

export function StarRating({ rating, max = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-0.5" aria-label={`امتیاز ${rating} از ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={cn("h-4 w-4", i < rating ? "text-accent-400" : "text-slate-200")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

interface QuoteCardProps {
  content: string;
  name: string;
  role: string;
  rating: number;
  avatar?: string;
}

export function QuoteCard({ content, name, role, rating, avatar }: QuoteCardProps) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand-200/80 hover:shadow-lg hover:shadow-brand-500/8 sm:p-5">
      <div className="absolute left-4 top-4 font-display text-6xl leading-none text-brand-100 transition-colors group-hover:text-brand-200">
        &ldquo;
      </div>
      <div className="relative mb-4 mt-6 flex items-center gap-3">
        {avatar && <Avatar src={avatar} alt={name} />}
        <div>
          <p className="font-display font-bold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
      <StarRating rating={rating} />
      <blockquote className="relative my-4 flex-1 text-sm leading-relaxed text-slate-600">
        {content}
      </blockquote>
    </div>
  );
}

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  href: string;
  image?: string;
  compact?: boolean;
}

export function BlogCard({ title, excerpt, date, category, href, image, compact }: BlogCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand-200/80 hover:shadow-lg hover:shadow-brand-500/10">
      <ImageCard
        src={image ?? IMAGES.hero.main}
        alt={title}
        height={compact ? "h-36" : "h-44"}
        overlay="gradient"
      >
        <div className="absolute bottom-4 right-4">
          <Badge>{category}</Badge>
        </div>
      </ImageCard>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <time className="mb-1.5 text-xs font-medium text-brand-600">{date}</time>
        <h3 className="mb-1.5 font-display text-base font-bold text-slate-900 transition-colors group-hover:text-brand-600 sm:text-lg">
          <a href={href}>{title}</a>
        </h3>
        <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-2">{excerpt}</p>
        <a
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          مطالعه بیشتر
          <ChevronDown className="h-4 w-4 -rotate-90 transition-transform group-hover:-translate-x-1" />
        </a>
      </div>
    </article>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
      {children}
    </span>
  );
}
