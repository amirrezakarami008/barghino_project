import { apiRequest } from "@/features/auth/lib/api";
import { parseBranch, parsePlant, parsePage, schemeTypeLabel, systemTypeLabel } from "@/features/plants";
import {
  parseContract,
  signedSnapshot,
  formatDecimal,
  localDate,
  contractDisplayTitle,
} from "@/features/contracts";
import { contractStatusMeta } from "@/features/contracts/status-map";
import {
  formatArea,
  formatMoney,
  localDate as installLocalDate,
  type InstallMedia,
  type InstallRequest,
} from "@/features/installs/install-model";
import { installStatusMeta } from "@/features/installs/status-map";
import type { StatusTone } from "@/components/ui";
import { formatLastAction } from "./admin-audit";
import { getInstallReviewQueue, submitInstallMediaReview } from "./admin-installs-api";

export type ReviewKind = "branches" | "plants" | "contracts" | "renewals" | "installs";

export type ReviewMedia = {
  readonly uuid: string;
  readonly storedFileUuid: string;
  readonly originalName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
};

export type ReviewHistoryEvent = {
  readonly uuid: string;
  readonly fromStage: string;
  readonly toStage: string;
  readonly createdAt: string;
  readonly event: string;
};

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
  readonly statusLabel?: string;
  readonly statusTone?: StatusTone;
  readonly subtitle?: string;
  readonly stage?: string;
  readonly media?: readonly ReviewMedia[];
  readonly history?: readonly ReviewHistoryEvent[];
  readonly note?: string;
  readonly visitAt?: string;
  readonly visitSummary?: string;
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

function queuePath(kind: Exclude<ReviewKind, "installs">): string {
  if (kind === "contracts") return "/staff/contracts/";
  if (kind === "renewals") return "/staff/contracts/renewals/";
  return `/staff/${kind}/`;
}

function mapInstallMedia(entry: InstallMedia): ReviewMedia {
  return {
    uuid: entry.uuid,
    storedFileUuid: entry.storedFileUuid,
    originalName: entry.originalName,
    contentType: entry.contentType,
    sizeBytes: entry.sizeBytes,
  };
}

function mapInstallReviewItem(entry: InstallRequest): ReviewItem {
  const status = installStatusMeta(entry.stage);
  const mediaDecision =
    entry.mediaReviewDecision === "approved"
      ? "تأییدشده"
      : entry.mediaReviewDecision === "rejected"
        ? "ردشده"
        : entry.mediaReviewDecision || "در انتظار";

  return {
    uuid: entry.uuid,
    title: entry.address,
    subtitle: entry.phone ? `موبایل ${entry.phone}` : undefined,
    stage: entry.stage,
    statusLabel: status.label,
    statusTone: status.tone,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    reviewedAt: entry.mediaReviewedAt,
    reviewDecision: entry.mediaReviewDecision,
    reviewNote: entry.mediaReviewNote,
    note: entry.note,
    visitAt: entry.visitAt,
    visitSummary: entry.visitSummary,
    media: entry.media.map(mapInstallMedia),
    history: entry.history.map((event) => ({
      uuid: event.uuid,
      fromStage: event.fromStage,
      toStage: event.toStage,
      createdAt: event.createdAt,
      event: event.event,
    })),
    lastAction: entry.mediaReviewedAt
      ? formatLastAction({
          reviewedAt: entry.mediaReviewedAt,
          reviewDecision: entry.mediaReviewDecision,
          reviewNote: entry.mediaReviewNote,
          updatedAt: entry.updatedAt,
          createdAt: entry.createdAt,
        })
      : `ارسال‌شده · ${installLocalDate(entry.createdAt)}`,
    fields: [
      ["مرحله", status.label],
      ["موبایل", entry.phone || "—"],
      ["مساحت نصب", `${formatArea(entry.areaM2)} متر مربع`],
      ["بررسی رسانه", mediaDecision],
      ["زمان بازدید", entry.visitAt ? installLocalDate(entry.visitAt) : "—"],
      ["ظرفیت پیشنهادی", entry.proposalCapacityKwp ? `${formatArea(entry.proposalCapacityKwp)} kWp` : "—"],
      ["تعداد پنل", entry.proposalPanelCount === null ? "—" : String(entry.proposalPanelCount)],
      ["هزینه پیشنهادی", formatMoney(entry.proposalCostToman)],
      ["تولید ماهانه", entry.proposalMonthlyKwh ? `${formatArea(entry.proposalMonthlyKwh)} kWh` : "—"],
      ["درآمد ماهانه", formatMoney(entry.proposalMonthlyIncomeToman)],
      ["برآورد کاتالوگ", formatMoney(entry.catalogEstimateTotalToman)],
      ["تعداد رسانه", String(entry.media.length)],
      ["یادداشت کاربر", entry.note.trim() || "—"],
      ["خلاصه بازدید", entry.visitSummary.trim() || "—"],
    ],
  };
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
  const status = contractStatusMeta(entry.status);
  const sellerName =
    seller?.company_name?.trim() ||
    [seller?.first_name, seller?.last_name].filter(Boolean).join(" ").trim() ||
    "—";
  const planName = snapshot?.terms.planName || entry.planName || "—";
  const billId = snapshot?.branch.billId || entry.billId || "—";
  const address = snapshot?.branch.address || entry.address || "—";
  const rate = formatDecimal(snapshot?.terms.rate ?? entry.rate);
  const commitment = formatDecimal(snapshot?.terms.commitment ?? entry.commitment);

  return {
    uuid: entry.uuid,
    title: snapshot?.plant.name || contractDisplayTitle(entry),
    subtitle: entry.contractNumber ? `شماره ${entry.contractNumber}` : undefined,
    signature: entry.signatureUuid || undefined,
    statusLabel: status.label,
    statusTone: status.tone,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    reviewedAt: entry.reviewedAt,
    reviewDecision: entry.reviewDecision,
    reviewNote: entry.reviewNote,
    lastAction: entry.signedAt
      ? `امضا شده · ${localDate(entry.signedAt)}`
      : formatLastAction({
          reviewedAt: entry.reviewedAt,
          reviewDecision: entry.reviewDecision,
          reviewNote: entry.reviewNote,
          updatedAt: entry.updatedAt,
          createdAt: entry.createdAt,
        }),
    fields: [
      ["وضعیت", status.label],
      ["فروشنده", sellerName],
      ["شناسه قبض", billId],
      ["نشانی", address],
      ["پلن", planName],
      ["نرخ خرید", rate],
      ["تعهد انرژی", commitment],
      ["شروع", calendarDate(entry.startsOn) || "—"],
      ["پایان", calendarDate(entry.endsOn) || "—"],
      ["نسخه سند", entry.termsVersion || "—"],
      ["هش سند", entry.termsHash || "—"],
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
  if (kind === "installs") {
    const result = await getInstallReviewQueue(page, signal);
    return {
      count: result.count,
      next: result.next,
      previous: result.previous,
      results: result.results.map(mapInstallReviewItem),
    };
  }

  const params = new URLSearchParams({ page: String(page), page_size: "12" });
  if (search.trim()) params.set("search", search.trim());
  if (kind === "branches" || kind === "plants") params.set("status", "pending");
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
  if (kind === "installs") {
    await submitInstallMediaReview(uuid, { decision, reason });
    return;
  }
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
  installs: number;
}> {
  const [branches, plants, contracts, renewals, installs] = await Promise.all([
    getReviewQueue("branches", 1, "", signal),
    getReviewQueue("plants", 1, "", signal),
    getReviewQueue("contracts", 1, "", signal),
    getReviewQueue("renewals", 1, "", signal),
    getReviewQueue("installs", 1, "", signal),
  ]);
  return {
    branches: branches.count,
    plants: plants.count,
    contracts: contracts.count,
    renewals: renewals.count,
    installs: installs.count,
  };
}
