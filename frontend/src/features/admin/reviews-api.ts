import { apiRequest } from "@/features/auth/lib/api";
import { parseBranch, parsePlant, parsePage } from "@/features/plants";
import { parseContract, signedSnapshot, formatDecimal } from "@/features/contracts";

export type ReviewKind = "branches" | "plants" | "contracts";
export type ReviewItem = { readonly uuid: string; readonly title: string; readonly fields: readonly (readonly [string, string])[]; readonly signature?: string };
export type ReviewPage = { readonly count: number; readonly next: boolean; readonly previous: boolean; readonly results: readonly ReviewItem[] };
export async function getReviewQueue(kind: ReviewKind, page: number, signal: AbortSignal): Promise<ReviewPage> {
  const raw = await apiRequest<unknown>(`/staff/${kind}/?page=${page}&page_size=12`, { auth: true, signal });
  if (kind === "branches") {
    const result = parsePage(raw, parseBranch);
    return { ...result, results: result.results.map((entry) => ({ uuid: entry.uuid, title: entry.name, fields: [["شماره کاربر", entry.owner_phone], ["شماره کنتور", entry.meter_number], ["نشانی", entry.address]] })) };
  }
  if (kind === "plants") {
    const result = parsePage(raw, parsePlant);
    return { ...result, results: result.results.map((entry) => ({ uuid: entry.uuid, title: entry.name, fields: [["شماره کاربر", entry.owner_phone], ["ظرفیت (kWp)", entry.capacity_kwp], ["نشانی", entry.address], ["شناسه انشعاب", entry.branch_uuid]] })) };
  }
  const result = parsePage(raw, parseContract);
  return { ...result, results: result.results.map((entry) => {
    const snapshot = signedSnapshot(entry), seller = snapshot?.seller;
    return { uuid: entry.uuid, title: snapshot?.plant.name ?? entry.plantName, signature: entry.signatureUuid, fields: [
      ["نسخهٔ اطلاعات", snapshot ? "ثبت‌شده هنگام امضا" : "نسخهٔ امضا در دسترس نیست؛ قبل از تصمیم بررسی کنید"],
      ["فروشنده", seller?.company_name ?? [seller?.first_name, seller?.last_name].filter(Boolean).join(" ")],
      ["شماره کنتور", snapshot?.branch.meter ?? entry.meter], ["نشانی", snapshot?.branch.address ?? entry.address],
      ["پلن", snapshot?.terms.planName ?? entry.planName], ["نرخ خرید / تومان", formatDecimal(snapshot?.terms.rate ?? entry.rate)],
      ["تعهد / kWh", formatDecimal(snapshot?.terms.commitment ?? entry.commitment)], ["نسخه سند", entry.termsVersion], ["هش سند", entry.termsHash],
    ] };
  }) };
}
export async function submitReview(kind: ReviewKind, uuid: string, decision: "approved" | "rejected", reason: string): Promise<void> {
  await apiRequest<unknown>(`/staff/${kind}/${encodeURIComponent(uuid)}/review/`, { auth: true, method: "POST", body: { decision, reason } });
}
