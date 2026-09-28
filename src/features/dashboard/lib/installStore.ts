import type {
  InstallMediaAttachment,
  InstallProposal,
  InstallRequest,
  InstallRequestStep,
  InstallStepEvent,
  SolarPlant,
} from "@/shared/types/dashboard";
import {
  getInstallStepLabel,
  getNextInstallStep,
} from "@/features/dashboard/constants/install";
import { saveCustomPlant } from "@/features/dashboard/lib/plantStore";
import { SITE_CONFIG } from "@/config";
import { estimateEquipmentCost } from "@/features/equipment/lib/pricing";
import { getActiveEquipment } from "@/features/equipment/lib/store";
import { parsePersianNumber } from "@/shared/lib/numbers";
import { deleteFileBlob, saveFileBlob } from "@/features/contracts/lib/files";
import { createId, formatFileSize } from "@/features/contracts/lib/format";

export const INSTALL_STORAGE_KEY = "barghino:install-requests-v1";
export const INSTALL_EVENT = "barghino:install-updated";
export const INSTALL_MEDIA_PREFIX = "barghino:install-media";

export const MAX_INSTALL_MEDIA_BYTES = 25 * 1024 * 1024;
export const MAX_INSTALL_MEDIA_FILES = 3;
export const ACCEPTED_INSTALL_MEDIA =
  "image/jpeg,image/png,image/webp,image/heic,video/mp4,video/webm,video/quicktime";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function createInstallId() {
  return `ir-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INSTALL_EVENT));
}

export function formatInstallDate(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleDateString("fa-IR");
  }
}

function pushHistory(
  request: InstallRequest,
  step: InstallRequestStep,
  note?: string,
): InstallStepEvent[] {
  return [...request.history, { step, at: formatInstallDate(), note }];
}

function normalizeRequest(raw: InstallRequest): InstallRequest {
  return {
    ...raw,
    history: Array.isArray(raw.history) ? raw.history : [],
    media: Array.isArray(raw.media) ? raw.media : [],
    mediaReviewStatus: raw.mediaReviewStatus ?? "none",
  };
}

export function getInstallRequests(): InstallRequest[] {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(INSTALL_STORAGE_KEY) ?? "[]") as InstallRequest[];
    return Array.isArray(parsed) ? parsed.map(normalizeRequest) : [];
  } catch {
    return [];
  }
}

function writeRequests(requests: InstallRequest[]) {
  localStorage.setItem(INSTALL_STORAGE_KEY, JSON.stringify(requests));
  emit();
}

function updateRequest(id: string, updater: (req: InstallRequest) => InstallRequest) {
  const next = getInstallRequests().map((item) => (item.id === id ? updater(item) : item));
  writeRequests(next);
  return next.find((item) => item.id === id) ?? null;
}

export function getLatestInstallRequest(): InstallRequest | null {
  return getInstallRequests()[0] ?? null;
}

export function getInstallRequestById(id: string): InstallRequest | null {
  return getInstallRequests().find((item) => item.id === id) ?? null;
}

export function getPendingMediaReviews(): InstallRequest[] {
  return getInstallRequests().filter(
    (req) => req.currentStep === "review" && req.mediaReviewStatus === "pending",
  );
}

export function saveInstallRequest(input: {
  address: string;
  note?: string;
  phone?: string;
  area?: string;
}): InstallRequest {
  const areaM2 = input.area ? Number(input.area) : undefined;
  const request: InstallRequest = {
    id: createInstallId(),
    address: input.address.trim(),
    phone: input.phone?.trim() || undefined,
    areaM2: Number.isFinite(areaM2) ? areaM2 : undefined,
    submittedAt: formatInstallDate(),
    currentStep: "submitted",
    note: input.note?.trim() || undefined,
    media: [],
    mediaReviewStatus: "none",
    history: [
      {
        step: "submitted",
        at: formatInstallDate(),
        note: "درخواست نصب ثبت شد — در انتظار ارسال عکس/ویدیو برای بررسی اولیه",
      },
    ],
  };

  writeRequests([request, ...getInstallRequests()]);
  return request;
}

function guessMediaKind(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  const name = file.name.toLowerCase();
  if (/\.(jpe?g|png|webp|heic)$/.test(name)) return "image";
  if (/\.(mp4|webm|mov)$/.test(name)) return "video";
  return null;
}

/** افزودن عکس/ویدیو به درخواست */
export async function addInstallMedia(requestId: string, file: File): Promise<InstallRequest | null> {
  const current = getInstallRequestById(requestId);
  if (!current) throw new Error("درخواست یافت نشد.");
  if (current.currentStep !== "submitted" && current.mediaReviewStatus !== "rejected") {
    throw new Error("در این مرحله امکان بارگذاری فایل نیست.");
  }

  const existing = current.media ?? [];
  if (existing.length >= MAX_INSTALL_MEDIA_FILES) {
    throw new Error(`حداکثر ${MAX_INSTALL_MEDIA_FILES} فایل می‌توانید ارسال کنید.`);
  }

  const kind = guessMediaKind(file);
  if (!kind) {
    throw new Error("فقط تصویر (JPG/PNG/WebP) یا ویدیو (MP4/WebM) مجاز است.");
  }
  if (file.size > MAX_INSTALL_MEDIA_BYTES) {
    throw new Error(`حجم فایل نباید بیشتر از ${formatFileSize(MAX_INSTALL_MEDIA_BYTES)} باشد.`);
  }

  const id = createId("im");
  const storageKey = `${INSTALL_MEDIA_PREFIX}:${requestId}:${id}`;
  await saveFileBlob(storageKey, file);

  const attachment: InstallMediaAttachment = {
    id,
    kind,
    fileName: file.name,
    mimeType: file.type || (kind === "image" ? "image/jpeg" : "video/mp4"),
    sizeBytes: file.size,
    storageKey,
    uploadedAt: formatInstallDate(),
  };

  return updateRequest(requestId, (req) => ({
    ...req,
    media: [...(req.media ?? []), attachment],
    mediaReviewStatus: req.mediaReviewStatus === "rejected" ? "rejected" : "none",
  }));
}

export async function removeInstallMedia(
  requestId: string,
  mediaId: string,
): Promise<InstallRequest | null> {
  const current = getInstallRequestById(requestId);
  if (!current) return null;
  const target = current.media?.find((m) => m.id === mediaId);
  if (!target) return current;

  if (
    current.mediaReviewStatus === "pending" ||
    current.mediaReviewStatus === "approved"
  ) {
    throw new Error("پس از ارسال برای بررسی، حذف فایل ممکن نیست مگر پس از رد شدن.");
  }

  await deleteFileBlob(target.storageKey);
  return updateRequest(requestId, (req) => ({
    ...req,
    media: (req.media ?? []).filter((m) => m.id !== mediaId),
  }));
}

/** ارسال مدارک برای بررسی اولیه ادمین/AI */
export function submitInstallMediaForReview(requestId: string): InstallRequest | null {
  const current = getInstallRequestById(requestId);
  if (!current) return null;
  if (!(current.media?.length)) {
    throw new Error("حداقل یک عکس یا ویدیو از پشت‌بام بارگذاری کنید.");
  }
  if (current.currentStep !== "submitted" && current.mediaReviewStatus !== "rejected") {
    throw new Error("مدارک قبلاً برای بررسی ارسال شده‌اند.");
  }

  return updateRequest(requestId, (req) => {
    const goingToReview = req.currentStep === "submitted";
    return {
      ...req,
      currentStep: "review",
      mediaReviewStatus: "pending",
      mediaReviewNote: undefined,
      mediaReviewedAt: undefined,
      mediaReviewedBy: undefined,
      history: goingToReview
        ? pushHistory(req, "review", "عکس/ویدیو ارسال شد — منتظر تأیید بررسی اولیه")
        : [
            ...req.history,
            {
              step: "review",
              at: formatInstallDate(),
              note: "مدارک جدید ارسال شد — منتظر تأیید مجدد",
            },
          ],
    };
  });
}

/** تأیید بررسی اولیه → ادامه به بازدید */
export function approveInstallMediaReview(
  requestId: string,
  options?: { by?: "admin" | "ai"; note?: string },
): InstallRequest | null {
  const current = getInstallRequestById(requestId);
  if (!current) return null;
  if (current.currentStep !== "review" || current.mediaReviewStatus !== "pending") {
    throw new Error("این درخواست در صف بررسی اولیه نیست.");
  }
  if (!(current.media?.length)) {
    throw new Error("مدارک بررسی یافت نشد.");
  }

  const by = options?.by ?? "admin";
  const note =
    options?.note?.trim() ||
    (by === "ai"
      ? "بررسی اولیه با هوش مصنوعی تأیید شد"
      : "بررسی اولیه توسط ادمین تأیید شد");

  return updateRequest(requestId, (req) => {
    const visit = new Date();
    visit.setDate(visit.getDate() + 3);
    return {
      ...req,
      currentStep: "visit",
      mediaReviewStatus: "approved",
      mediaReviewedBy: by,
      mediaReviewedAt: formatInstallDate(),
      mediaReviewNote: note,
      scheduledVisitAt: formatInstallDate(visit),
      history: [
        ...req.history,
        { step: "review", at: formatInstallDate(), note },
        {
          step: "visit",
          at: formatInstallDate(),
          note: "بازدید کارشناس زمان‌بندی شد",
        },
      ],
    };
  });
}

export function rejectInstallMediaReview(
  requestId: string,
  reason?: string,
): InstallRequest | null {
  const current = getInstallRequestById(requestId);
  if (!current) return null;
  if (current.currentStep !== "review" || current.mediaReviewStatus !== "pending") {
    throw new Error("این درخواست در صف بررسی اولیه نیست.");
  }

  const note =
    reason?.trim() ||
    "مدارک کافی نبود؛ لطفاً عکس یا ویدیو واضح‌تری از پشت‌بام ارسال کنید.";

  return updateRequest(requestId, (req) => ({
    ...req,
    mediaReviewStatus: "rejected",
    mediaReviewedBy: "admin",
    mediaReviewedAt: formatInstallDate(),
    mediaReviewNote: note,
    history: [
      ...req.history,
      {
        step: "review",
        at: formatInstallDate(),
        note: `رد بررسی اولیه: ${note}`,
      },
    ],
  }));
}

/** برآورد طرح فنی از مساحت پشت‌بام — هزینه بر اساس تجهیزات فعال */
export function buildProposalFromRequest(request: InstallRequest): InstallProposal {
  const area = request.areaM2 && request.areaM2 > 0 ? request.areaM2 : 45;
  const capacityKwp = Math.max(3, Math.min(10, Math.round(area / 9)));
  const equipment = getActiveEquipment();
  const costEstimate = estimateEquipmentCost(capacityKwp, equipment);
  const panelLine = costEstimate.lines.find((line) => line.item.category === "panel");
  const panelCount = panelLine?.quantity ?? capacityKwp * 2;
  const estimatedMonthlyKwh = capacityKwp * 120;
  const rate = parsePersianNumber(SITE_CONFIG.valueProps.barghinoPrice);

  return {
    capacityKwp,
    panelCount,
    estimatedCostToman: costEstimate.totalToman,
    estimatedMonthlyKwh,
    estimatedMonthlyIncomeToman: estimatedMonthlyKwh * rate,
    visitSummary:
      "پشت‌بام بدون سایه بحرانی ارزیابی شد. جهت جنوب‌غربی مناسب است و استحکام سازه برای نصب استاندارد تأیید شد.",
  };
}

function buildPlantFromRequest(request: InstallRequest): SolarPlant {
  const proposal = request.proposal ?? buildProposalFromRequest(request);
  const meter = String(10000000 + Math.floor(Math.random() * 89999999));

  return {
    id: `sp-install-${request.id}`,
    name: `نیروگاه خانگی — ${request.address.slice(0, 28)}`,
    address: request.address,
    capacityKwp: proposal.capacityKwp,
    monthlyProductionKwh: proposal.estimatedMonthlyKwh,
    startDate: formatInstallDate(),
    status: "active",
    meterNumber: meter.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d),
  };
}

const ADVANCE_NOTES: Partial<Record<InstallRequestStep, string>> = {
  visit: "بازدید کارشناس زمان‌بندی شد",
  proposal: "نتیجه بازدید ثبت و طرح پیشنهادی آماده شد",
  contract: "طرح پذیرفته شد؛ قرارداد آماده امضا است",
  installation: "قرارداد امضا شد؛ نصب در صف اجرا قرار گرفت",
  active: "نصب تکمیل و نیروگاه راه‌اندازی شد",
};

/**
 * یک مرحله را جلو می‌برد.
 * submitted→review و review→visit فقط از مسیر آپلود/تأیید مدارک انجام می‌شود.
 */
export function advanceInstallSimulation(id: string): InstallRequest | null {
  const current = getInstallRequestById(id);
  if (!current || current.currentStep === "active") return current;

  if (current.currentStep === "submitted") {
    throw new Error("برای ادامه، ابتدا عکس یا ویدیو بفرستید و برای بررسی اولیه ارسال کنید.");
  }

  if (current.currentStep === "review") {
    throw new Error("ادامه روند پس از تأیید بررسی اولیه (ادمین یا AI) ممکن است.");
  }

  const nextStep = getNextInstallStep(current.currentStep);
  if (!nextStep) return current;

  return updateRequest(id, (req) => {
    const next: InstallRequest = {
      ...req,
      currentStep: nextStep,
      history: pushHistory(req, nextStep, ADVANCE_NOTES[nextStep]),
    };

    if (nextStep === "proposal") {
      next.proposal = buildProposalFromRequest(req);
    }

    if (nextStep === "installation") {
      next.contractSignedAt = formatInstallDate();
    }

    if (nextStep === "active") {
      next.proposal = req.proposal ?? buildProposalFromRequest(req);
      const plant = buildPlantFromRequest(next);
      saveCustomPlant(plant);
      next.plantId = plant.id;
      next.history = [
        ...req.history,
        {
          step: "active",
          at: formatInstallDate(),
          note: `نیروگاه فعال شد · ظرفیت ${plant.capacityKwp} کیلووات`,
        },
      ];
    }

    return next;
  });
}

/** سازگاری با API قبلی */
export function advanceInstallStep(id: string, step: InstallRequestStep) {
  updateRequest(id, (req) => ({
    ...req,
    currentStep: step,
    history: pushHistory(req, step, getInstallStepLabel(step)),
  }));
}

export function resetInstallRequests() {
  if (!canUseStorage()) return;
  localStorage.removeItem(INSTALL_STORAGE_KEY);
  emit();
}

export function subscribeInstall(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(INSTALL_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(INSTALL_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function formatToman(n: number) {
  return `${n.toLocaleString("fa-IR")} تومان`;
}

export { formatFileSize };
