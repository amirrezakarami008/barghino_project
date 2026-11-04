import { ApiError, apiRequest } from "@/features/auth/lib/api";
import {
  ContractDataError,
  occupiedBranchIds,
  parseBranch,
  parseContract,
  parsePage,
  parsePlan,
  parsePlant,
  record,
  type Branch,
  type Contract,
  type Page,
  type Plan,
  type PlantOption,
} from "./contract-model";

export const contractPageSize = 12;
export async function getContracts(page: number, signal?: AbortSignal): Promise<Page<Contract>> {
  return parsePage(await apiRequest<unknown>(`/contracts/?page=${page}&page_size=${contractPageSize}`, { auth: true, signal }), parseContract);
}

/** Branch UUIDs already tied to a non-terminal contract for this owner. */
export async function listOccupiedBranchIds(signal?: AbortSignal): Promise<ReadonlySet<string>> {
  const contracts: Contract[] = [];
  let page = 1;
  for (;;) {
    const batch = await getContracts(page, signal);
    contracts.push(...batch.results);
    if (!batch.next) break;
    page += 1;
  }
  return occupiedBranchIds(contracts);
}
export async function getContract(uuid: string, signal?: AbortSignal): Promise<Contract> {
  return parseContract(await apiRequest<unknown>(`/contracts/${encodeURIComponent(uuid)}/`, { auth: true, signal }));
}
export async function createDraft(plantUuid: string, planUuid: string): Promise<Contract> {
  return parseContract(await apiRequest<unknown>("/contracts/", { method: "POST", auth: true, body: { plant_uuid: plantUuid, plan_uuid: planUuid } }));
}
export type SignContractInput = {
  readonly acceptedTerms: true;
  readonly termsVersion: string;
  readonly termsSha256: string;
  readonly signatureFileUuid: string;
  readonly nationalIdFileUuid: string;
  readonly signedPdfFileUuid: string;
};
export async function signContract(uuid: string, input: SignContractInput): Promise<Contract> {
  return parseContract(
    await apiRequest<unknown>(`/contracts/${encodeURIComponent(uuid)}/sign/`, {
      method: "POST",
      auth: true,
      body: {
        accepted_terms: input.acceptedTerms,
        terms_version: input.termsVersion,
        terms_sha256: input.termsSha256,
        signature_file_uuid: input.signatureFileUuid,
        national_id_file_uuid: input.nationalIdFileUuid,
        signed_pdf_file_uuid: input.signedPdfFileUuid,
      },
    }),
  );
}
export async function getPlantChoices(page: number, signal?: AbortSignal): Promise<Page<PlantOption>> {
  const plants = parsePage(await apiRequest<unknown>(`/plants/?page=${page}&page_size=12`, { auth: true, signal }), parsePlant);
  const branchIds = [...new Set(plants.results.map((plant) => plant.branchUuid))];
  const branches = await Promise.all(branchIds.map(async (id): Promise<Branch | null> => {
    try { return parseBranch(await apiRequest<unknown>(`/branches/${encodeURIComponent(id)}/`, { auth: true, signal })); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
  }));
  return { ...plants, results: plants.results.map((plant) => ({ plant, branch: branches.find((branch) => branch?.uuid === plant.branchUuid) ?? null })) };
}
export async function getPlanChoices(signal?: AbortSignal): Promise<Page<Plan>> {
  return parsePage(await apiRequest<unknown>("/catalog/plans/?is_active=true&page_size=100", { auth: true, signal }), parsePlan);
}
export type UploadedPrivateFile = { readonly uuid: string; readonly contentType: string; readonly purpose: string };
export type SignatureFile = UploadedPrivateFile;
async function uploadPrivateFile(
  blob: Blob,
  purpose: "contract" | "national_id",
  fileName: string,
  allowedTypes: readonly string[],
  maxBytes: number,
  invalidMessage: string,
): Promise<UploadedPrivateFile> {
  if (!allowedTypes.includes(blob.type) || blob.size === 0 || blob.size > maxBytes) throw new Error(invalidMessage);
  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("purpose", purpose);
  form.append("visibility", "private");
  const raw = record(await apiRequest<unknown>("/files/", { method: "POST", auth: true, body: form }));
  if (
    typeof raw.uuid !== "string" ||
    !raw.uuid ||
    raw.purpose !== purpose ||
    raw.visibility !== "private" ||
    typeof raw.content_type !== "string" ||
    !allowedTypes.includes(raw.content_type)
  ) {
    throw new ContractDataError();
  }
  return { uuid: raw.uuid, contentType: raw.content_type, purpose };
}
export async function uploadSignature(blob: Blob): Promise<SignatureFile> {
  const extension = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "webp";
  return uploadPrivateFile(
    blob,
    "contract",
    `signature.${extension}`,
    ["image/png", "image/jpeg", "image/webp"],
    signatureMaxBytes,
    "تصویر امضا باید PNG، JPEG یا WebP و حداکثر ۱۵ مگابایت باشد.",
  );
}
export async function uploadNationalIdFile(file: File): Promise<UploadedPrivateFile> {
  const extension =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/jpeg"
          ? "jpg"
          : "webp";
  return uploadPrivateFile(
    file,
    "national_id",
    `national-id.${extension}`,
    ["image/png", "image/jpeg", "image/webp", "application/pdf"],
    nationalIdMaxBytes,
    "کارت ملی باید PNG، JPEG، WebP یا PDF و حداکثر ۱۰ مگابایت باشد.",
  );
}
export async function uploadSignedPdf(file: File): Promise<UploadedPrivateFile> {
  return uploadPrivateFile(
    file,
    "contract",
    file.name.toLowerCase().endsWith(".pdf") ? file.name : "signed-contract.pdf",
    ["application/pdf"],
    signatureMaxBytes,
    "فایل قرارداد امضاشده باید PDF و حداکثر ۱۵ مگابایت باشد.",
  );
}
export async function getSignatureContent(uuid: string, signal?: AbortSignal): Promise<Blob> {
  const blob = await apiRequest<Blob>(`/files/${encodeURIComponent(uuid)}/content/`, { auth: true, responseType: "blob", signal });
  if (!isSignatureType(blob.type) || blob.size > signatureMaxBytes) throw new ContractDataError();
  return blob;
}
export const signatureMaxBytes = 15 * 1024 * 1024;
export const nationalIdMaxBytes = 10 * 1024 * 1024;
export function isSignatureType(type: string): boolean { return ["image/png", "image/jpeg", "image/webp"].includes(type); }

export function contractError(error: unknown): string {
  if (error instanceof ContractDataError) return error.message;
  if (!(error instanceof ApiError)) return "انجام درخواست ممکن نشد. اتصال را بررسی کنید و دوباره تلاش کنید.";
  if (error.status === 401) return "نشست شما معتبر نیست؛ دوباره وارد شوید.";
  if (error.status === 403) return "به این اطلاعات دسترسی ندارید.";
  if (error.status === 404) return "این مورد پیدا نشد یا دیگر در دسترس حساب شما نیست.";
  if (error.status === 0) return "ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی کنید.";
  if (error.status === 429) return "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.";
  if (error.status >= 500) return "سرویس قراردادها پاسخ نداد. کمی بعد وضعیت را دوباره دریافت کنید.";
  if (error.fields.plant || error.fields.plant_uuid) return "نیروگاه انتخاب‌شده در دسترس نیست یا تأیید نشده است؛ وضعیت آن را تازه‌سازی کنید.";
  if (error.fields.branch) return "انشعاب متصل به نیروگاه باید تأیید شده باشد.";
  if (error.fields.plan || error.fields.plan_uuid) return "پلن انتخاب‌شده دیگر فعال یا در دسترس نیست؛ پلن‌ها را تازه‌سازی کنید.";
  if (error.fields.identity_profile) return "اطلاعات هویتی لازم برای امضا کامل نیست. پروفایل را بررسی کنید.";
  if (error.fields.file || error.fields.signature_file_uuid) return "فایل پذیرفته نشد؛ فرمت و حجم تصویر امضا را بررسی کنید.";
  if (error.fields.national_id_file_uuid) return "فایل کارت ملی پذیرفته نشد؛ فرمت و حجم را بررسی کنید.";
  if (error.fields.signed_pdf_file_uuid) return "PDF امضاشده پذیرفته نشد؛ فقط PDF معتبر آپلود کنید.";
  if (error.fields.birth_certificate_number || error.fields.representative_birth_certificate_number) {
    return "شماره شناسنامه در پروفایل ثبت نشده؛ از صفحه پروفایل تکمیل کنید.";
  }
  if (error.fields.accepted_terms) return "برای ارسال امضا باید شرایط سند را بپذیرید.";
  if (error.fields.terms_version || error.fields.terms_sha256) return "نسخه یا اثر سند معتبر نیست؛ صفحه را تازه کنید و دوباره امضا کنید.";
  if (error.fields.detail) return Array.isArray(error.fields.detail) ? String(error.fields.detail[0]) : String(error.fields.detail);
  return "درخواست پذیرفته نشد. اطلاعات و وضعیت قرارداد را دوباره بررسی کنید.";
}
export function mutationMayHaveSucceeded(error: unknown): boolean { return error instanceof ContractDataError || error instanceof SyntaxError || (error instanceof ApiError && (error.status === 0 || error.status >= 500)); }
