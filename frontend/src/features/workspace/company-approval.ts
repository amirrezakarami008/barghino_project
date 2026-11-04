import { getBranches, getPlants } from "@/features/plants/plants-api";

export type CompanyApproval = "none" | "pending" | "approved" | "rejected";

export type CompanyApprovalState = {
  readonly state: CompanyApproval;
  readonly note: string;
};

type CacheEntry = CompanyApprovalState & {
  readonly at: number;
  readonly inflight?: Promise<CompanyApprovalState>;
};

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();

/** Deduped + short-lived cache so profile remounts / Strict Mode don't spam plants+branches. */
export async function loadCompanyApproval(userKey: string): Promise<CompanyApprovalState> {
  const cached = cache.get(userKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS && !cached.inflight) {
    return { state: cached.state, note: cached.note };
  }
  if (cached?.inflight) return cached.inflight;

  const inflight = (async (): Promise<CompanyApprovalState> => {
    const signal = AbortSignal.timeout(15000);
    const [plants, branches] = await Promise.all([getPlants(1, signal), getBranches(1, signal)]);
    const assets = [...plants.results, ...branches.results];
    let result: CompanyApprovalState;
    if (!assets.length) {
      result = {
        state: "none",
        note: "هنوز انشعاب یا نیروگاهی برای بررسی شرکت ثبت نشده است.",
      };
    } else if (assets.some((item) => item.status === "active")) {
      result = {
        state: "approved",
        note: "دست‌کم یک انشعاب یا نیروگاه تأییدشده دارید.",
      };
    } else if (assets.some((item) => item.status === "inactive")) {
      const note = assets.find((item) => item.status === "inactive" && item.review_note)?.review_note;
      result = {
        state: "rejected",
        note: note || "دست‌کم یک مورد رد شده است؛ جزئیات در نیروگاه من.",
      };
    } else {
      result = {
        state: "pending",
        note: "انشعاب یا نیروگاه ثبت شده و در انتظار بررسی شرکت است.",
      };
    }
    cache.set(userKey, { ...result, at: Date.now() });
    return result;
  })().catch((error: unknown) => {
    cache.delete(userKey);
    throw error;
  });

  cache.set(userKey, {
    state: cached?.state ?? "none",
    note: cached?.note ?? "",
    at: cached?.at ?? 0,
    inflight,
  });

  return inflight;
}
