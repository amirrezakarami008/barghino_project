import type {
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
import { parsePersianNumber } from "@/shared/lib/numbers";

export const INSTALL_STORAGE_KEY = "barghino:install-requests-v1";
export const INSTALL_EVENT = "barghino:install-updated";

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
  };
}

export function getInstallRequests(): InstallRequest[] {
  if (typeof window === "undefined") return [];
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
    history: [
      {
        step: "submitted",
        at: formatInstallDate(),
        note: "درخواست نصب ثبت شد",
      },
    ],
  };

  writeRequests([request, ...getInstallRequests()]);
  return request;
}

/** برآورد طرح فنی از مساحت پشت‌بام (شبیه‌سازی) */
export function buildProposalFromRequest(request: InstallRequest): InstallProposal {
  const area = request.areaM2 && request.areaM2 > 0 ? request.areaM2 : 45;
  const capacityKwp = Math.max(3, Math.min(10, Math.round(area / 9)));
  const panelCount = capacityKwp * 2;
  const estimatedMonthlyKwh = capacityKwp * 120;
  const rate = parsePersianNumber(SITE_CONFIG.valueProps.barghinoPrice);
  const costPerKwp = 45_000_000;

  return {
    capacityKwp,
    panelCount,
    estimatedCostToman: capacityKwp * costPerKwp,
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
  review: "بررسی اولیه انجام و درخواست تأیید شد",
  visit: "بازدید کارشناس زمان‌بندی شد",
  proposal: "نتیجه بازدید ثبت و طرح پیشنهادی آماده شد",
  contract: "طرح پذیرفته شد؛ قرارداد آماده امضا است",
  installation: "قرارداد امضا شد؛ نصب در صف اجرا قرار گرفت",
  active: "نصب تکمیل و نیروگاه راه‌اندازی شد",
};

/**
 * یک مرحله شبیه‌سازی را جلو می‌برد و داده‌های لازم همان مرحله را می‌سازد.
 * در مرحله نهایی، نیروگاه سفارشی در plantStore ذخیره می‌شود.
 */
export function advanceInstallSimulation(id: string): InstallRequest | null {
  const current = getInstallRequestById(id);
  if (!current || current.currentStep === "active") return current;

  const nextStep = getNextInstallStep(current.currentStep);
  if (!nextStep) return current;

  return updateRequest(id, (req) => {
    const next: InstallRequest = {
      ...req,
      currentStep: nextStep,
      history: pushHistory(req, nextStep, ADVANCE_NOTES[nextStep]),
    };

    if (nextStep === "visit") {
      const visit = new Date();
      visit.setDate(visit.getDate() + 3);
      next.scheduledVisitAt = formatInstallDate(visit);
    }

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
  if (typeof window === "undefined") return;
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
