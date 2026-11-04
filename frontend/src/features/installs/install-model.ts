export type Page<T> = {
  readonly count: number;
  readonly next: boolean;
  readonly previous: boolean;
  readonly results: readonly T[];
};

export type InstallMedia = {
  readonly uuid: string;
  readonly storedFileUuid: string;
  readonly originalName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly url: string;
  readonly createdAt: string;
};

export type InstallHistoryEvent = {
  readonly uuid: string;
  readonly fromStage: string;
  readonly toStage: string;
  readonly actorUuid: string;
  readonly event: string;
  readonly createdAt: string;
};

export type InstallRequest = {
  readonly uuid: string;
  readonly stage: string;
  readonly address: string;
  readonly phone: string;
  readonly areaM2: string;
  readonly note: string;
  readonly mediaReviewDecision: string;
  readonly mediaReviewedAt: string;
  readonly mediaReviewNote: string;
  readonly reviewerKind: string;
  readonly visitAt: string;
  readonly proposalCapacityKwp: string | null;
  readonly proposalPanelCount: number | null;
  readonly proposalCostToman: number | null;
  readonly proposalMonthlyKwh: string | null;
  readonly proposalMonthlyIncomeToman: number | null;
  readonly visitSummary: string;
  readonly catalogEstimateTotalToman: number | null;
  readonly branchUuid: string;
  readonly plantUuid: string;
  readonly activatedAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly media: readonly InstallMedia[];
  readonly history: readonly InstallHistoryEvent[];
};

export type Remote<T> =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: T };

export class InstallDataError extends Error {
  constructor() {
    super("اطلاعات دریافتی کامل یا قابل‌خواندن نیست. دوباره دریافت کنید.");
    this.name = "InstallDataError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new InstallDataError();
  return value;
}

function text(value: unknown): string {
  if (value == null) return "";
  if (typeof value !== "string") throw new InstallDataError();
  return value;
}

function required(value: unknown): string {
  const result = text(value);
  if (!result) throw new InstallDataError();
  return result;
}

function optionalUuid(value: unknown): string {
  if (value == null) return "";
  return required(value);
}

function decimal(value: unknown): string {
  if (typeof value !== "string" && typeof value !== "number") throw new InstallDataError();
  const result = String(value);
  if (!/^\d+(\.\d+)?$/.test(result)) throw new InstallDataError();
  return result;
}

function optionalDecimal(value: unknown): string | null {
  if (value == null) return null;
  return decimal(value);
}

function optionalNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new InstallDataError();
  return value;
}

function integer(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new InstallDataError();
  return value;
}

export function parseInstallMedia(value: unknown): InstallMedia {
  const raw = record(value);
  return {
    uuid: required(raw.uuid),
    storedFileUuid: required(raw.stored_file_uuid),
    originalName: text(raw.original_name),
    contentType: text(raw.content_type),
    sizeBytes: integer(raw.size_bytes),
    url: text(raw.url),
    createdAt: required(raw.created_at),
  };
}

function parseHistoryEvent(value: unknown): InstallHistoryEvent {
  const raw = record(value);
  const details = raw.details;
  const event = isRecord(details)
    ? text(details.event)
    : typeof details === "string"
      ? details
      : "";
  return {
    uuid: required(raw.uuid),
    fromStage: text(raw.from_stage),
    toStage: text(raw.to_stage),
    actorUuid: text(raw.actor_uuid),
    event,
    createdAt: required(raw.created_at),
  };
}

export function parseInstallRequest(value: unknown): InstallRequest {
  const raw = record(value);
  if (!Array.isArray(raw.media)) throw new InstallDataError();
  if (!Array.isArray(raw.history)) throw new InstallDataError();
  const stage = required(raw.stage ?? raw.status);
  return {
    uuid: required(raw.uuid),
    stage,
    address: required(raw.address),
    phone: required(raw.phone),
    areaM2: decimal(raw.area_m2),
    note: text(raw.note),
    mediaReviewDecision: text(raw.media_review_decision),
    mediaReviewedAt: text(raw.media_reviewed_at),
    mediaReviewNote: text(raw.media_review_note),
    reviewerKind: text(raw.reviewer_kind),
    visitAt: text(raw.visit_at),
    proposalCapacityKwp: optionalDecimal(raw.proposal_capacity_kwp),
    proposalPanelCount: optionalNumber(raw.proposal_panel_count),
    proposalCostToman: optionalNumber(raw.proposal_cost_toman),
    proposalMonthlyKwh: optionalDecimal(raw.proposal_monthly_kwh),
    proposalMonthlyIncomeToman: optionalNumber(raw.proposal_monthly_income_toman),
    visitSummary: text(raw.visit_summary),
    catalogEstimateTotalToman: optionalNumber(raw.catalog_estimate_total_toman),
    branchUuid: optionalUuid(raw.branch_uuid),
    plantUuid: optionalUuid(raw.plant_uuid),
    activatedAt: text(raw.activated_at),
    createdAt: required(raw.created_at),
    updatedAt: required(raw.updated_at),
    media: raw.media.map(parseInstallMedia),
    history: raw.history.map(parseHistoryEvent),
  };
}

export function parsePage<T>(value: unknown, parse: (item: unknown) => T): Page<T> {
  const raw = record(value);
  if (
    typeof raw.count !== "number" ||
    !Number.isSafeInteger(raw.count) ||
    raw.count < 0 ||
    !Array.isArray(raw.results)
  ) {
    throw new InstallDataError();
  }
  if (
    (raw.next !== null && typeof raw.next !== "string") ||
    (raw.previous !== null && typeof raw.previous !== "string")
  ) {
    throw new InstallDataError();
  }
  return {
    count: raw.count,
    next: typeof raw.next === "string",
    previous: typeof raw.previous === "string",
    results: raw.results.map(parse),
  };
}

export function formatArea(value: string): string {
  const [integerPart = "", fraction] = value.split(".");
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return `${grouped}${fraction ? `٫${fraction}` : ""}`.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

export function formatMoney(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function localDate(value: string): string {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "ثبت نشده";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${faDigits(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${faDigits((bytes / 1024).toFixed(1))} کیلوبایت`;
  return `${faDigits((bytes / (1024 * 1024)).toFixed(1))} مگابایت`;
}

function faDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}
