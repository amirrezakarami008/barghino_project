import { apiRequest } from "@/features/auth/lib/api";
import { parseBranch, parsePlant, parsePage, schemeTypeLabel, systemTypeLabel } from "@/features/plants";
import {
  parseContract,
  signedSnapshot,
  formatDecimal,
  localDate,
  contractDisplayTitle,
} from "@/features/contracts";
import { formatLastAction } from "./admin-audit";

export type ReviewKind = "branches" | "plants" | "contracts" | "renewals";

export type ReviewItem = {
  readonly uuid: string;
  readonly title: string;
  readonly fields: readonly (readonly [string, string])[];
  readonly signature?: string;
  readonly lastAction: string;
  readonly branchUuid?: string;
  readonly ownerUuid?: string;
  readonly ownerPhone?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly reviewedAt?: string;
  readonly reviewDecision?: string;
  readonly reviewNote?: string;
};

export type ReviewPage = {
  readonly count: number;
  readonly next: boolean;
  readonly previous: boolean;
  readonly results: readonly ReviewItem[];
};

const REJECT_MIN = 8;

export function rejectReasonMinLength(): number {
  return REJECT_MIN;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("پاسخ سرویس قابل خواندن نیست.");
  }
  return value as Record<string, unknown>;
}

function queuePath(kind: ReviewKind): string {
  if (kind === "contracts") return "/contracts/";
  if (kind === "renewals") return "/staff/contracts/renewals/";
  return `/staff/${kind}/`;
}

function calendarDate(value: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(date);
  }
  return localDate(value);
}

function mapContractReviewItem(entry: ReturnType<typeof parseContract>): ReviewItem {
  const snapshot = signedSnapshot(entry);
  const seller = snapshot?.seller;
  return {
    uuid: entry.uuid,
    title: snapshot?.plant.name || contractDisplayTitle(entry),
    signature: entry.signatureUuid,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    reviewedAt: entry.reviewedAt,
    reviewDecision: entry.reviewDecision,
    reviewNote: entry.reviewNote,
    lastAction: formatLastAction({
      reviewedAt: entry.reviewedAt,
      reviewDecision: entry.reviewDecision,
      reviewNote: entry.reviewNote,
      updatedAt: entry.updatedAt,
      createdAt: entry.createdAt,
    }),
    fields: [
      ["نسخهٔ اطلاعات", snapshot ? "ثبت‌شده هنگام امضا" : "نسخهٔ امضا در دسترس نیست؛ قبل از تصمیم بررسی کنید"],
      [
        "فروشنده",
        seller?.company_name ?? [seller?.first_name, seller?.last_name].filter(Boolean).join(" "),
      ],
      ["شناسه قبض", snapshot?.branch.billId ?? entry.billId],
      ["نشانی", snapshot?.branch.address ?? entry.address],
      ["پلن", snapshot?.terms.planName ?? entry.planName],
      ["نرخ خرید / تومان", formatDecimal(snapshot?.terms.rate ?? entry.rate)],
      ["تعهد / kWh", formatDecimal(snapshot?.terms.commitment ?? entry.commitment)],
      ["نسخه سند", entry.termsVersion],
      ["هش سند", entry.termsHash],
    ],
  };
}

function mapRenewalItem(entry: ReturnType<typeof parseContract>): ReviewItem {
  return {
    uuid: entry.uuid,
    title: contractDisplayTitle(entry),
    signature: entry.signatureUuid || undefined,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    reviewedAt: entry.reviewedAt,
    reviewDecision: entry.reviewDecision,
    reviewNote: entry.reviewNote,
    lastAction: entry.renewalRequestedAt
      ? `درخواست تمدید · ${localDate(entry.renewalRequestedAt)}`
      : formatLastAction({
          updatedAt: entry.updatedAt,
          createdAt: entry.createdAt,
        }),
    fields: [
      ["شماره قرارداد", entry.contractNumber],
      ["وضعیت", entry.status],
      ["شروع", calendarDate(entry.startsOn)],
      ["پایان", calendarDate(entry.endsOn)],
      ["نزدیک به انقضا", entry.isNearExpiry ? "بله" : "خیر"],
      ["پلن", entry.planName],
      ["نرخ خرید / تومان", formatDecimal(entry.rate)],
      ["تعهد / kWh", formatDecimal(entry.commitment)],
      ["شناسه قبض", entry.billId],
      ["نشانی", entry.address],
    ],
  };
}

export async function getReviewQueue(
  kind: ReviewKind,
  page: number,
  search: string,
  signal: AbortSignal,
): Promise<ReviewPage> {
  const params = new URLSearchParams({ page: String(page), page_size: "12" });
  if (search.trim()) params.set("search", search.trim());
  const raw = await apiRequest<unknown>(`${queuePath(kind)}?${params}`, { auth: true, signal });

  if (kind === "branches") {
    const result = parsePage(raw, (item) => {
      const entry = parseBranch(item);
      const rawItem = record(item);
      return {
        ...entry,
        ownerUuid: text(rawItem.owner_uuid),
        reviewedAt: text(rawItem.reviewed_at),
        reviewDecision: text(rawItem.review_decision),
        updatedAt: text(rawItem.updated_at),
        createdAt: text(rawItem.created_at),
      };
    });
    return {
      ...result,
      results: result.results.map((entry) => ({
        uuid: entry.uuid,
        title: entry.name,
        ownerUuid: entry.ownerUuid,
        ownerPhone: entry.owner_phone,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        reviewedAt: entry.reviewedAt,
        reviewDecision: entry.reviewDecision,
        reviewNote: entry.review_note,
        lastAction: formatLastAction({
          reviewedAt: entry.reviewedAt,
          reviewDecision: entry.reviewDecision,
          reviewNote: entry.review_note,
          updatedAt: entry.updatedAt,
          createdAt: entry.createdAt,
        }),
        fields: [
          ["شماره کاربر", entry.owner_phone],
          ["شناسه قبض", entry.bill_id],
          ["نشانی", entry.address],
          ["وضعیت", entry.status],
        ],
      })),
    };
  }

  if (kind === "plants") {
    const result = parsePage(raw, (item) => {
      const entry = parsePlant(item);
      const rawItem = record(item);
      return {
        ...entry,
        ownerUuid: text(rawItem.owner_uuid),
        reviewedAt: text(rawItem.reviewed_at),
        reviewDecision: text(rawItem.review_decision),
        updatedAt: text(rawItem.updated_at),
        createdAt: text(rawItem.created_at),
      };
    });
    return {
      ...result,
      results: result.results.map((entry) => ({
        uuid: entry.uuid,
        title: entry.name,
        branchUuid: entry.branch_uuid,
        ownerUuid: entry.ownerUuid,
        ownerPhone: entry.owner_phone,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        reviewedAt: entry.reviewedAt,
        reviewDecision: entry.reviewDecision,
        reviewNote: entry.review_note,
        lastAction: formatLastAction({
          reviewedAt: entry.reviewedAt,
          reviewDecision: entry.reviewDecision,
          reviewNote: entry.review_note,
          updatedAt: entry.updatedAt,
          createdAt: entry.createdAt,
        }),
        fields: [
          ["شماره کاربر", entry.owner_phone],
          ["ظرفیت (kWp)", entry.capacity_kwp],
          ["کاربری طرح", schemeTypeLabel(entry.scheme_type)],
          ["اتصال شبکه", systemTypeLabel(entry.system_type)],
          ["نشانی", entry.address],
          ["شناسه انشعاب", entry.branch_uuid],
          ["وضعیت", entry.status],
        ],
      })),
    };
  }

  if (kind === "renewals") {
    const result = parsePage(raw, parseContract);
    return {
      ...result,
      results: result.results.map(mapRenewalItem),
    };
  }

  const result = parsePage(raw, parseContract);
  return {
    ...result,
    results: result.results.map(mapContractReviewItem),
  };
}

export async function submitReview(
  kind: Exclude<ReviewKind, "renewals">,
  uuid: string,
  decision: "approved" | "rejected",
  reason: string,
): Promise<void> {
  await apiRequest<unknown>(`/staff/${kind}/${encodeURIComponent(uuid)}/review/`, {
    auth: true,
    method: "POST",
    body: { decision, reason },
  });
}

export async function processRenewal(uuid: string): Promise<void> {
  await apiRequest<unknown>(`/staff/contracts/${encodeURIComponent(uuid)}/renewal/`, {
    auth: true,
    method: "POST",
  });
}

export async function getQueueCounts(signal: AbortSignal): Promise<{
  branches: number;
  plants: number;
  contracts: number;
  renewals: number;
}> {
  const [branches, plants, contracts, renewals] = await Promise.all([
    getReviewQueue("branches", 1, "", signal),
    getReviewQueue("plants", 1, "", signal),
    getReviewQueue("contracts", 1, "", signal),
    getReviewQueue("renewals", 1, "", signal),
  ]);
  return {
    branches: branches.count,
    plants: plants.count,
    contracts: contracts.count,
    renewals: renewals.count,
  };
}
