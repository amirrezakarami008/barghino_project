"use client";

import { getAllPosts } from "@/features/blog/lib/store";
import type { BlogPost } from "@/shared/types";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("barghma:blog-updated", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("barghma:blog-updated", onStoreChange);
  };
}

export function useBlogPosts(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts ?? false;

  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getAllPosts({ includeDrafts })),
    () => JSON.stringify(getAllPosts({ includeDrafts: false })),
  );

  return {
    posts: JSON.parse(snapshot) as BlogPost[],
  };
}

export function useBlogPost(slug: string, options?: { includeDrafts?: boolean }) {
  const { posts } = useBlogPosts({ includeDrafts: options?.includeDrafts ?? true });
  return {
    post: posts.find((p) => p.slug === slug),
  };
}
