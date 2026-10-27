"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { apiRequest } from "@/features/auth/lib/api";
import {
  clearSession,
  readSession,
  sessionSnapshot,
  subscribeSession,
  writeSession,
  type AuthUser,
  type Session,
} from "@/features/auth/lib/session";

type AuthContextValue = {
  session: Session | null;
  profile: AuthUser | null;
  ready: boolean;
  signIn: (session: Session) => void;
  hydrateProfile: (user: AuthUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeSession, sessionSnapshot, () => null);
  const ready = useClientReady();
  const session = useMemo(() => parseStoredSession(raw), [raw]);
  const [verifiedProfile, setVerifiedProfile] = useState<AuthUser | null>(null);
  const hydrateProfile = useCallback((user: AuthUser) => {
    setVerifiedProfile((current) =>
      current && JSON.stringify(current) === JSON.stringify(user) ? current : user,
    );
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile: verifiedProfile?.uuid === session?.user.uuid ? verifiedProfile : session?.user ?? null,
      ready,
      signIn(next) {
        setVerifiedProfile(null);
        writeSession(next);
      },
      hydrateProfile,
      async signOut() {
        const current = readSession();
        if (current) {
          try {
            await apiRequest("/auth/logout/", {
              method: "POST",
              auth: true,
              body: { refresh: current.refresh },
            });
          } catch {
            clearSession();
          }
        }
        clearSession();
        router.replace("/login");
      },
    }),
    [hydrateProfile, ready, router, session, verifiedProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

function parseStoredSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.access || !parsed.refresh || !parsed.user?.phone) return null;
    if (parsed.user.role !== "admin" && parsed.user.role !== "user") return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

export function destinationFor(user: AuthUser, next: string | null) {
  if (next === "/admin" || next?.startsWith("/admin/")) return user.role === "admin" ? next : "/panel";
  if (next === "/panel" || next?.startsWith("/panel/")) return next;
  return user.role === "admin" ? "/admin" : "/panel";
}
