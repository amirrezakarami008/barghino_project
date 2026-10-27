export type AuthUser = {
  uuid: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  path: string;
  accountType: string;
  username?: string;
  email?: string;
  nationalId?: string | null;
  companyName?: string | null;
  companyNationalId?: string | null;
  identityProfile?: Record<string, string | null> | null;
  identityProfileCompletion?: { isComplete: boolean; missingFields: string[] } | null;
  dateJoined?: string | null;
  isPhoneVerified?: boolean;
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
    username: String(user.username ?? ""),
    email: String(user.email ?? ""),
    nationalId: nullableString(user.national_id),
    companyName: nullableString(user.company_name),
    companyNationalId: nullableString(user.company_national_id),
    identityProfile: parseIdentityProfile(user.identity_profile),
    identityProfileCompletion: parseIdentityProfileCompletion(user.identity_profile_completion),
    dateJoined: nullableString(user.date_joined),
    isPhoneVerified: user.is_phone_verified === true,
  };
}

function nullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function parseIdentityProfile(value: unknown): AuthUser["identityProfile"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, field]) =>
      typeof field === "string" ? [[key, field]] : [],
    ),
  );
}

function parseIdentityProfileCompletion(value: unknown): AuthUser["identityProfileCompletion"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const completion = value as Record<string, unknown>;
  return {
    isComplete: completion.is_complete === true,
    missingFields: Array.isArray(completion.missing_fields)
      ? completion.missing_fields.filter((field): field is string => typeof field === "string")
      : [],
  };
}
