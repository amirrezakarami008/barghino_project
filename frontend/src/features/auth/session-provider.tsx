"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
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
  ready: boolean;
  signIn: (session: Session) => void;
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

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      ready,
      signIn(next) {
        writeSession(next);
      },
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
    [ready, router, session],
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
