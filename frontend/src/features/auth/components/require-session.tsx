"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/features/auth/session-provider";

export function RequireSession({ area, children }: { area: "user" | "admin"; children: ReactNode }) {
  const { session, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (area === "admin" && session.user.role !== "admin") router.replace("/panel");
  }, [area, pathname, ready, router, session]);

  if (!ready) return <p className="text-sm text-muted-foreground">در حال بررسی نشست…</p>;
  if (!session) return null;
  if (area === "admin" && session.user.role !== "admin") return null;
  return children;
}
