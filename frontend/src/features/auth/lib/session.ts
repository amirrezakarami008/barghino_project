export type AuthUser = {
  uuid: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  path: string;
  accountType: string;
};

export type Session = {
  access: string;
  refresh: string;
  user: AuthUser;
};

const storageKey = "barghino.session";
const changeEvent = "barghino-session";

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey);
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

export function writeSession(session: Session) {
  window.localStorage.setItem(storageKey, JSON.stringify(session));
  window.dispatchEvent(new Event(changeEvent));
}

export function clearSession() {
  window.localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeSession(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function sessionSnapshot() {
  return window.localStorage.getItem(storageKey);
}

export function userFromApi(value: unknown): AuthUser {
  const user = (value ?? {}) as Record<string, unknown>;
  return {
    uuid: String(user.uuid ?? ""),
    phone: String(user.phone ?? ""),
    firstName: String(user.first_name ?? ""),
    lastName: String(user.last_name ?? ""),
    role: user.role === "admin" ? "admin" : "user",
    path: String(user.path ?? ""),
    accountType: String(user.account_type ?? ""),
  };
}
