import { BLOG_POSTS } from "@/features/marketing/constants/blog";
import { BLOG_STORAGE_KEY } from "@/features/blog/constants";
import type { BlogPost } from "@/shared/types";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function withDefaults(post: BlogPost): BlogPost {
  return {
    status: "published",
    featured: false,
    source: "custom",
    author: post.author ?? "برقینو",
    ...post,
    href: post.href || `/blog/${post.slug}`,
  };
}

export function readCustomPosts(): BlogPost[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BlogPost[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(withDefaults);
  } catch {
    return [];
  }
}

export function writeCustomPosts(posts: BlogPost[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event("barghma:blog-updated"));
}

export function getSeedPosts(): BlogPost[] {
  return BLOG_POSTS.map((post) =>
    withDefaults({
      ...post,
      source: "seed",
      status: "published",
      featured: Boolean(post.featured),
    }),
  );
}

export function getAllPosts(options?: { includeDrafts?: boolean }): BlogPost[] {
  const includeDrafts = options?.includeDrafts ?? false;
  const custom = readCustomPosts();
  const seed = getSeedPosts();
  const bySlug = new Map<string, BlogPost>();

  for (const post of seed) bySlug.set(post.slug, post);
  for (const post of custom) bySlug.set(post.slug, post);

  const posts = Array.from(bySlug.values());
  const filtered = includeDrafts ? posts : posts.filter((p) => (p.status ?? "published") === "published");

  return filtered.sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
    return b.id.localeCompare(a.id);
  });
}

export function getPostBySlug(slug: string, options?: { includeDrafts?: boolean }): BlogPost | undefined {
  return getAllPosts({ includeDrafts: options?.includeDrafts ?? true }).find((p) => p.slug === slug);
}

export function saveCustomPost(post: BlogPost): BlogPost {
  const normalized = withDefaults(post);
  const existing = readCustomPosts().filter((p) => p.id !== normalized.id && p.slug !== normalized.slug);
  writeCustomPosts([normalized, ...existing]);
  return normalized;
}

export function deleteCustomPost(id: string) {
  writeCustomPosts(readCustomPosts().filter((p) => p.id !== id));
}

export function isSlugTaken(slug: string, excludeId?: string): boolean {
  return getAllPosts({ includeDrafts: true }).some((p) => p.slug === slug && p.id !== excludeId);
}
