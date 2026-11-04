"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ApiError } from "@/features/auth/lib/api";
import { getMe } from "@/features/auth/lib/profile-api";
import { clearSession, readSession, writeSession, type AuthUser, type Session } from "@/features/auth/lib/session";
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

  // Stable key: token refresh must NOT remount the whole panel (that re-fires page effects).
  return (
    <VerifiedSession area={area} userKey={session.user.uuid || session.user.phone} pathname={pathname}>
      {children}
    </VerifiedSession>
  );
}

function VerifiedSession({
  area,
  userKey,
  pathname,
  children,
}: {
  area: "user" | "admin";
  userKey: string;
  pathname: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { hydrateProfile } = useAuth();
  const pathnameRef = useRef(pathname);
  const [attempt, setAttempt] = useState(0);
  const [verification, setVerification] = useState<Verification | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        const user = await getMe();
        if (!active) return;
        const current = readSession();
        if (!current) return;
        if (!user.uuid || !user.phone || (user.role !== "user" && user.role !== "admin")) {
          throw new ApiError("نشست معتبر نیست. دوباره وارد شوید.", 401, "invalid_session", {});
        }

        hydrateProfile(user);
        if (!sameUser(current.user, user)) {
          writeSession({ ...current, user });
        }
        setVerification({ attempt, user });
        if (area === "admin" && user.role !== "admin") router.replace("/panel");
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession();
          router.replace(`/login?next=${encodeURIComponent(pathnameRef.current)}`);
          return;
        }
        setVerification({
          attempt,
          error: "بررسی نشست انجام نشد. اتصال را بررسی کنید و دوباره تلاش کنید.",
        });
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, [area, attempt, hydrateProfile, router, userKey]);

  if (!verification || verification.attempt !== attempt) return <SessionLoading />;
  if (verification.error) {
    return (
      <div className="grid min-h-dvh place-content-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm leading-7 text-muted-foreground">
          {verification.error}
        </p>
        <Button type="button" onClick={() => setAttempt((current) => current + 1)}>
          تلاش دوباره
        </Button>
      </div>
    );
  }
  if (area === "admin" && verification.user?.role !== "admin") return null;
  return children;
}

function sameUser(a: AuthUser, b: AuthUser): boolean {
  return (
    a.uuid === b.uuid &&
    a.phone === b.phone &&
    a.role === b.role &&
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    (a.email ?? "") === (b.email ?? "") &&
    a.path === b.path &&
    a.accountType === b.accountType &&
    a.isPhoneVerified === b.isPhoneVerified &&
    JSON.stringify(a.identityProfile ?? null) === JSON.stringify(b.identityProfile ?? null) &&
    JSON.stringify(a.identityProfileCompletion ?? null) === JSON.stringify(b.identityProfileCompletion ?? null)
  );
}

function SessionLoading() {
  return (
    <p role="status" className="p-6 text-sm text-muted-foreground">
      در حال بررسی نشست…
    </p>
  );
}
