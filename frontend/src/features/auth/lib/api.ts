import { env } from "@/config/env";
import { translateApiMessage } from "@/features/auth/lib/messages";
import { clearSession, readSession, writeSession, type Session } from "@/features/auth/lib/session";

export const otpTtlSeconds = 120;

export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string>;

  constructor(message: string, status: number, code: string, fields: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

let refreshing: Promise<string | null> | null = null;

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.auth) {
    const access = readSession()?.access;
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}/api/v1${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ApiError("ارتباط با سرویس برقرار نشد.", 0, "network", {});
  }

  if (response.status === 401 && options.auth && options.retry !== false) {
    const access = await refreshAccess();
    if (access) return apiRequest<T>(path, { ...options, retry: false });
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function refreshAccess() {
  const session = readSession();
  if (!session) return null;
  if (!refreshing) {
    refreshing = requestRefresh(session).finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function requestRefresh(session: Session) {
  try {
    const response = await fetch(`${env.apiUrl}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: session.refresh }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      clearSession();
      return null;
    }
    const data = (await response.json()) as { access?: string; refresh?: string };
    if (!data.access || !data.refresh) {
      clearSession();
      return null;
    }
    const current = readSession() ?? session;
    writeSession({ ...current, access: data.access, refresh: data.refresh });
    return data.access;
  } catch {
    return null;
  }
}

async function toApiError(response: Response) {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const error = (payload as { error?: { code?: string; detail?: unknown } } | null)?.error;
  const code = error?.code ?? "error";
  const parsed = parseDetail(error?.detail);
  const message =
    code === "otp_invalid"
      ? translateApiMessage("The code is invalid or has expired.")
      : code === "otp_attempts_exceeded"
        ? translateApiMessage("Too many attempts. Request a new code.")
        : code === "throttled"
          ? translateApiMessage("Too many code requests. Try again later.")
          : (parsed.form ?? "درخواست انجام نشد. دوباره تلاش کنید.");
  return new ApiError(message, response.status, code, parsed.fields);
}

function parseDetail(detail: unknown) {
  if (typeof detail === "string") return { form: translateApiMessage(detail), fields: {} };
  if (Array.isArray(detail)) {
    const first = detail.find((item) => typeof item === "string");
    return { form: translateApiMessage(String(first ?? "")), fields: {} };
  }
  if (!detail || typeof detail !== "object") return { form: undefined, fields: {} };

  const record = detail as Record<string, unknown>;
  if (typeof record.detail === "string") {
    return { form: translateApiMessage(record.detail), fields: {} };
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    const text = Array.isArray(value) ? value.find((item) => typeof item === "string") : value;
    if (typeof text === "string" && text) fields[key] = translateApiMessage(text);
  }
  if (fields.non_field_errors) {
    return { form: fields.non_field_errors, fields };
  }
  return { form: undefined, fields };
}
