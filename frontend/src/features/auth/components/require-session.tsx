"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { clearSession, readSession, userFromApi, writeSession, type AuthUser, type Session } from "@/features/auth/lib/session";
import { useAuth } from "@/features/auth/session-provider";
import { Button } from "@/shared/ui/button";

type Verification = { attempt: number } & ({ user: AuthUser; error?: never } | { error: string; user?: never });

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
  }, [pathname, ready, router, session]);

  if (!ready) return <SessionLoading />;
  if (!session) return null;

  return (
    <VerifiedSession
      key={`${area}:${session.access}:${session.refresh}`}
      area={area}
      session={session}
      pathname={pathname}
    >
      {children}
    </VerifiedSession>
  );
}

function VerifiedSession({ area, session, pathname, children }: {
  area: "user" | "admin";
  session: Session;
  pathname: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { hydrateProfile } = useAuth();
  const pathnameRef = useRef(pathname);
  const [attempt, setAttempt] = useState(0);
  const [verification, setVerification] = useState<Verification | null>(null);
  const { access, refresh } = session;

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        const profile = await apiRequest<{ uuid: string; phone: string; role: string }>("/auth/me/", { auth: true });
        if (!active) return;
        const current = readSession();
        // Refreshing or switching accounts remounts the guard with new tokens.
        if (!current || current.access !== access || current.refresh !== refresh) return;
        if (!profile.uuid || !profile.phone || (profile.role !== "user" && profile.role !== "admin")) {
          throw new ApiError("نشست معتبر نیست. دوباره وارد شوید.", 401, "invalid_session", {});
        }

        const user = userFromApi(profile);
        hydrateProfile(user);
        if (current.user.role !== user.role) writeSession({ ...current, user: { ...current.user, role: user.role } });
        setVerification({ attempt, user });
        if (area === "admin" && user.role !== "admin") router.replace("/panel");
      } catch (error) {
        if (!active) return;
        const current = readSession();
        if (!current || current.access !== access || current.refresh !== refresh) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession();
          router.replace(`/login?next=${encodeURIComponent(pathnameRef.current)}`);
          return;
        }
        setVerification({ attempt, error: "بررسی نشست انجام نشد. اتصال را بررسی کنید و دوباره تلاش کنید." });
      }
    }

    void verify();
    return () => { active = false; };
  }, [access, refresh, area, attempt, router, hydrateProfile]);

  if (!verification || verification.attempt !== attempt) return <SessionLoading />;
  if (verification.error) {
    return (
      <div className="grid min-h-dvh place-content-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm leading-7 text-muted-foreground">{verification.error}</p>
        <Button type="button" onClick={() => setAttempt((current) => current + 1)}>تلاش دوباره</Button>
      </div>
    );
  }
  if (area === "admin" && verification.user?.role !== "admin") return null;
  return children;
}

function SessionLoading() {
  return <p role="status" className="p-6 text-sm text-muted-foreground">در حال بررسی نشست…</p>;
}
