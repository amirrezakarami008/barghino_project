export type Decimal = string;
export type Page<T> = { readonly count: number; readonly next: boolean; readonly previous: boolean; readonly results: readonly T[] };
export type Identity = Readonly<Record<string, string | null>>;
export type ContractSnapshot = {
  readonly seller: Identity;
  readonly plant: { readonly uuid: string; readonly name: string; readonly capacity: Decimal | null };
  readonly branch: { readonly uuid: string; readonly meter: string; readonly address: string };
  readonly terms: { readonly planName: string; readonly commitment: Decimal | null; readonly rate: Decimal | null };
};
export type ContractEvent = {
  readonly uuid: string; readonly type: string; readonly from: string; readonly to: string;
  readonly createdAt: string; readonly reason: string; readonly snapshot: ContractSnapshot | null;
  readonly termsVersion: string; readonly termsHash: string;
};
export type Contract = {
  readonly uuid: string; readonly status: string; readonly plantUuid: string; readonly plantName: string;
  readonly capacity: Decimal | null; readonly branchUuid: string; readonly meter: string; readonly address: string;
  readonly seller: Identity | null; readonly planUuid: string; readonly planName: string;
  readonly commitment: Decimal | null; readonly rate: Decimal | null;
  readonly createdAt: string; readonly updatedAt: string; readonly signedAt: string; readonly reviewedAt: string;
  readonly reviewDecision: string; readonly reviewNote: string; readonly termsVersion: string; readonly termsHash: string;
  readonly signatureUuid: string; readonly history: readonly ContractEvent[];
};
export type Plant = { readonly uuid: string; readonly name: string; readonly branchUuid: string; readonly capacity: Decimal | null; readonly status: string; readonly reviewNote: string };
export type Branch = { readonly uuid: string; readonly name: string; readonly meter: string; readonly address: string; readonly status: string };
export type Plan = { readonly uuid: string; readonly name: string; readonly description: string; readonly rate: Decimal | null; readonly commitment: Decimal | null; readonly benefits: readonly string[]; readonly recommended: boolean; readonly active: boolean };
export type PlantOption = { readonly plant: Plant; readonly branch: Branch | null };
export type Remote<T> = { readonly status: "loading" } | { readonly status: "error"; readonly message: string } | { readonly status: "ready"; readonly data: T };

export class ContractDataError extends Error {
  constructor() { super("اطلاعات دریافتی کامل یا قابل‌خواندن نیست. دوباره دریافت کنید."); this.name = "ContractDataError"; }
}
function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
export function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new ContractDataError();
  return value;
}
function text(value: unknown): string { if (value == null) return ""; if (typeof value !== "string") throw new ContractDataError(); return value; }
function required(value: unknown): string { const result = text(value); if (!result) throw new ContractDataError(); return result; }
function decimal(value: unknown): Decimal | null {
  if (value == null) return null;
  if (typeof value !== "string" && typeof value !== "number") throw new ContractDataError();
  const result = String(value); if (!/^-?\d+(\.\d+)?$/.test(result)) throw new ContractDataError(); return result;
}
function identity(value: unknown): Identity | null {
  if (value == null) return null;
  const result: Record<string, string | null> = {};
  for (const [key, item] of Object.entries(record(value))) { if (item !== null && typeof item !== "string") throw new ContractDataError(); result[key] = item; }
  return result;
}
export function parseSnapshot(value: unknown): ContractSnapshot | null {
  if (value == null) return null;
  try {
    const raw = record(value), plant = record(raw.plant), branch = record(raw.branch), terms = record(raw.commercial_terms);
    const seller = identity(raw.seller); if (!seller) return null;
    const identityFields = seller.kind === "individual" ? ["first_name", "last_name", "national_id"] : seller.kind === "legal" ? ["company_name", "company_national_id", "representative_first_name", "representative_last_name", "representative_national_id"] : [];
    if (!identityFields.length || identityFields.some((key) => !seller[key])) return null;
    if (decimal(terms.commitment_kwh) === null || decimal(terms.rate_toman_per_kwh) === null) return null;
    return { seller, plant: { uuid: required(plant.uuid), name: required(plant.name), capacity: decimal(plant.capacity_kwp) }, branch: { uuid: required(branch.uuid), meter: required(branch.meter_number), address: required(branch.address) }, terms: { planName: required(terms.plan_name), commitment: decimal(terms.commitment_kwh), rate: decimal(terms.rate_toman_per_kwh) } };
  } catch { return null; }
}
export function parseContract(value: unknown): Contract {
  const raw = record(value);
  if (!Array.isArray(raw.history)) throw new ContractDataError();
  return {
    uuid: required(raw.uuid), status: required(raw.status), plantUuid: text(raw.plant_uuid), plantName: text(raw.plant_name), capacity: decimal(raw.plant_capacity_kwp), branchUuid: text(raw.branch_uuid), meter: text(raw.meter_number), address: text(raw.branch_address), seller: identity(raw.seller_identity), planUuid: text(raw.plan_uuid), planName: text(raw.plan_name), commitment: decimal(raw.commitment_kwh), rate: decimal(raw.rate_toman_per_kwh), createdAt: required(raw.created_at), updatedAt: required(raw.updated_at), signedAt: text(raw.signed_at), reviewedAt: text(raw.reviewed_at), reviewDecision: text(raw.review_decision), reviewNote: text(raw.review_note), termsVersion: text(raw.terms_version), termsHash: text(raw.terms_sha256), signatureUuid: text(raw.signature_file_uuid),
    history: raw.history.map((item) => { const event = record(item), details = record(event.details ?? {}); return { uuid: required(event.uuid), type: required(event.event_type), from: text(event.from_status), to: text(event.to_status), createdAt: required(event.created_at), reason: text(details.reason), snapshot: parseSnapshot(details.contract_snapshot), termsVersion: text(details.accepted_terms_version), termsHash: text(details.accepted_terms_sha256) }; }),
  };
}
export function parsePlant(value: unknown): Plant { const raw = record(value); return { uuid: required(raw.uuid), name: required(raw.name), branchUuid: required(raw.branch_uuid), capacity: decimal(raw.capacity_kwp), status: required(raw.status), reviewNote: text(raw.review_note) }; }
export function parseBranch(value: unknown): Branch { const raw = record(value); return { uuid: required(raw.uuid), name: required(raw.name), meter: required(raw.meter_number), address: required(raw.address), status: required(raw.status) }; }
export function parsePlan(value: unknown): Plan {
  const raw = record(value);
  if (typeof raw.is_active !== "boolean" || typeof raw.is_recommended !== "boolean" || !Array.isArray(raw.benefits) || !raw.benefits.every((item) => typeof item === "string")) throw new ContractDataError();
  const rate = decimal(raw.rate_toman_per_kwh), commitment = decimal(raw.commitment_kwh);
  if (!rate || !commitment || rate.startsWith("-") || commitment.startsWith("-") || !/[1-9]/.test(rate) || !/[1-9]/.test(commitment)) throw new ContractDataError();
  return { uuid: required(raw.uuid), name: required(raw.name), description: text(raw.description), rate, commitment, benefits: raw.benefits, recommended: raw.is_recommended, active: raw.is_active };
}
export function parsePage<T>(value: unknown, parse: (item: unknown) => T): Page<T> {
  const raw = record(value);
  if (typeof raw.count !== "number" || !Number.isSafeInteger(raw.count) || raw.count < 0 || !Array.isArray(raw.results)) throw new ContractDataError();
  if ((raw.next !== null && typeof raw.next !== "string") || (raw.previous !== null && typeof raw.previous !== "string")) throw new ContractDataError();
  return { count: raw.count, next: typeof raw.next === "string", previous: typeof raw.previous === "string", results: raw.results.map(parse) };
}
export function signedSnapshot(contract: Contract): ContractSnapshot | null { return contract.history.find((event) => event.type === "signed" && event.snapshot)?.snapshot ?? null; }
export function eligibility(option: PlantOption): string | null {
  if (option.plant.status !== "active") return option.plant.status === "pending" ? "نیروگاه در انتظار بررسی است." : "نیروگاه تأیید نشده است.";
  if (!option.branch) return "اطلاعات انشعاب در دسترس نیست؛ دوباره دریافت کنید.";
  if (option.branch.status !== "active") return "انشعاب متصل هنوز تأیید نشده است.";
  return null;
}
export function formatDecimal(value: Decimal | null): string {
  if (value === null) return "—";
  const [integer = "", fraction] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return `${grouped}${fraction ? `٫${fraction}` : ""}`.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}
export function localDate(value: string): string {
  const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return "ثبت نشده";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
