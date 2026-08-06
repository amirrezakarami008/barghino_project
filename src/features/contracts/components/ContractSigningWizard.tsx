"use client";

import {
  DashboardPage,
  EmptyState,
  Panel,
} from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import { isValidIranMobile, isValidNationalId, onlyDigits } from "@/features/auth/lib/validation";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { SITE_CONFIG } from "@/config";
import { CONTRACT_PLANS, getContractPlanById } from "../constants";
import { ContractDocumentPreview } from "./ContractDocumentPreview";
import { SignaturePad } from "./SignaturePad";
import { useContract } from "../hooks/useContracts";
import { buildContractNumber } from "../lib/contract-content";
import { triggerDownload } from "../lib/files";
import { fileToDataUrl, generateContractPdf } from "../lib/generateContractPdf";
import { formatPersianDate, toPersianDigits } from "../lib/format";
import { canSignContract, completeContractSigning } from "../lib/store";
import type { ContractSigningDraft, ContractSigningStep } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Download,
  FileCheck,
  IdCard,
  Loader2,
  PenLine,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STEPS: { id: ContractSigningStep; label: string; icon: typeof UserRound }[] = [
  { id: "intro", label: "شروع", icon: ShieldCheck },
  { id: "plan", label: "پلن", icon: Sparkles },
  { id: "identity", label: "هویت", icon: UserRound },
  { id: "id-photo", label: "کارت ملی", icon: IdCard },
  { id: "review", label: "متن قرارداد", icon: FileCheck },
  { id: "signature", label: "امضا", icon: PenLine },
  { id: "done", label: "پایان", icon: CheckCircle2 },
];

const STEP_ORDER: ContractSigningStep[] = [
  "intro",
  "plan",
  "identity",
  "id-photo",
  "review",
  "signature",
  "done",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15";

interface ContractSigningWizardProps {
  contractId: string;
}

export function ContractSigningWizard({ contractId }: ContractSigningWizardProps) {
  const { contract } = useContract(contractId);
  const [step, setStep] = useState<ContractSigningStep>("intro");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [contractNumber, setContractNumber] = useState("");
  const [signedAt, setSignedAt] = useState("");

  const [draft, setDraft] = useState<ContractSigningDraft>(() => ({
    planId: "standard",
    fullName: DASHBOARD_USER.name,
    nationalId: isValidNationalId(DASHBOARD_USER.nationalId)
      ? onlyDigits(DASHBOARD_USER.nationalId)
      : "",
    birthCertificateNumber: "",
    phone: isValidIranMobile(DASHBOARD_USER.phone) ? onlyDigits(DASHBOARD_USER.phone) : "",
    address: "",
    nationalIdPhoto: null,
    nationalIdPhotoPreview: null,
    signatureDataUrl: null,
    acceptedTerms: false,
  }));

  const selectedPlan = useMemo(
    () => getContractPlanById(draft.planId) ?? CONTRACT_PLANS[1]!,
    [draft.planId],
  );

  useEffect(() => {
    return () => {
      if (draft.nationalIdPhotoPreview) URL.revokeObjectURL(draft.nationalIdPhotoPreview);
    };
  }, [draft.nationalIdPhotoPreview]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const partyPreview = useMemo(
    () => ({
      fullName: draft.fullName,
      nationalId: toPersianDigits(draft.nationalId || "—"),
      birthCertificateNumber: toPersianDigits(draft.birthCertificateNumber || "—"),
      phone: toPersianDigits(draft.phone || "—"),
      address: draft.address,
    }),
    [draft],
  );

  if (!contract) {
    return (
      <DashboardPage title="امضای قرارداد" subtitle="قرارداد یافت نشد">
        <EmptyState
          title="این قرارداد وجود ندارد"
          description="ممکن است حذف شده باشد یا شناسه نادرست باشد."
          action={
            <Button href="/dashboard/contracts" className="group">
              بازگشت
              <LinkArrow />
            </Button>
          }
        />
      </DashboardPage>
    );
  }

  if (!canSignContract(contract) && step !== "done") {
    return (
      <DashboardPage title="امضای قرارداد" subtitle={contract.title}>
        <Panel>
          <p className="text-sm text-slate-600">
            این قرارداد در وضعیت «{contract.status}» است و دیگر نیاز به امضا ندارد.
          </p>
          <Button href={`/dashboard/contracts/${contract.id}`} className="mt-4" size="sm">
            مشاهده قرارداد
          </Button>
        </Panel>
      </DashboardPage>
    );
  }

  function updateDraft<K extends keyof ContractSigningDraft>(key: K, value: ContractSigningDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validatePlan(): boolean {
    if (!draft.planId || !getContractPlanById(draft.planId)) {
      setErrors({ planId: "یکی از پلن‌ها را انتخاب کنید." });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateIdentity(): boolean {
    const next: Record<string, string> = {};
    if (draft.fullName.trim().length < 3) next.fullName = "نام و نام خانوادگی را کامل وارد کنید.";
    if (!isValidNationalId(draft.nationalId)) next.nationalId = "کد ملی معتبر نیست.";
    const birth = onlyDigits(draft.birthCertificateNumber);
    if (!birth || birth.length < 1 || birth.length > 12) {
      next.birthCertificateNumber = "شماره شناسنامه را وارد کنید (۱ تا ۱۲ رقم).";
    }
    if (!isValidIranMobile(draft.phone)) next.phone = "شماره موبایل معتبر نیست.";
    if (draft.address.trim().length < 8) next.address = "نشانی را کامل‌تر بنویسید.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validatePhoto(): boolean {
    if (!draft.nationalIdPhoto) {
      setErrors({ nationalIdPhoto: "تصویر کارت ملی الزامی است." });
      return false;
    }
    if (draft.nationalIdPhoto.size > 5 * 1024 * 1024) {
      setErrors({ nationalIdPhoto: "حجم تصویر حداکثر ۵ مگابایت باشد." });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateReview(): boolean {
    if (!draft.acceptedTerms) {
      setErrors({ acceptedTerms: "برای ادامه باید مفاد قرارداد را بپذیرید." });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateSignature(): boolean {
    if (!draft.signatureDataUrl) {
      setErrors({ signature: "لطفاً داخل کادر مشخص‌شده امضا کنید." });
      return false;
    }
    setErrors({});
    return true;
  }

  async function goNext() {
    if (step === "intro") {
      setStep("plan");
      return;
    }
    if (step === "plan") {
      if (!validatePlan()) return;
      setStep("identity");
      return;
    }
    if (step === "identity") {
      if (!validateIdentity()) return;
      setStep("id-photo");
      return;
    }
    if (step === "id-photo") {
      if (!validatePhoto()) return;
      setStep("review");
      return;
    }
    if (step === "review") {
      if (!validateReview()) return;
      setStep("signature");
      return;
    }
    if (step === "signature") {
      if (!validateSignature()) return;
      await submit();
    }
  }

  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]!);
  }

  async function submit() {
    if (!contract || !draft.nationalIdPhoto || !draft.signatureDataUrl) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const number = buildContractNumber(contract.id);
      const date = formatPersianDate();
      setContractNumber(number);
      setSignedAt(date);

      const startDate = contract.startDate === "—" ? date : contract.startDate;
      const endPlusOne = new Date();
      endPlusOne.setFullYear(endPlusOne.getFullYear() + 1);
      const endDate =
        contract.endDate === "—" ? formatPersianDate(endPlusOne) : contract.endDate;
      const volume = selectedPlan.volume;
      const rate = selectedPlan.rate;

      const nationalIdPhotoDataUrl = await fileToDataUrl(draft.nationalIdPhoto);

      const blob = await generateContractPdf({
        contract: {
          ...contract,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          volume,
          rate,
        },
        fullName: draft.fullName.trim(),
        nationalId: onlyDigits(draft.nationalId),
        birthCertificateNumber: onlyDigits(draft.birthCertificateNumber),
        phone: onlyDigits(draft.phone),
        address: draft.address.trim(),
        contractNumber: number,
        signedAt: date,
        nationalIdPhotoDataUrl,
        signatureDataUrl: draft.signatureDataUrl,
        startDate,
        endDate,
        volume,
        rate,
        planName: selectedPlan.name,
      });
      setPdfBlob(blob);

      await completeContractSigning(contract.id, {
        fullName: draft.fullName.trim(),
        nationalId: onlyDigits(draft.nationalId),
        birthCertificateNumber: onlyDigits(draft.birthCertificateNumber),
        phone: onlyDigits(draft.phone),
        address: draft.address.trim(),
        nationalIdPhoto: draft.nationalIdPhoto,
        signatureDataUrl: draft.signatureDataUrl,
        pdfBlob: blob,
        contractNumber: number,
        signedAt: date,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        volume,
        rate,
        savings: selectedPlan.savings,
      });

      setStep("done");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "ثبت قرارداد ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  function onPhotoChange(file: File | null) {
    if (draft.nationalIdPhotoPreview) URL.revokeObjectURL(draft.nationalIdPhotoPreview);
    if (!file) {
      updateDraft("nationalIdPhoto", null);
      updateDraft("nationalIdPhotoPreview", null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors({ nationalIdPhoto: "فقط تصویر (JPG/PNG/WebP) مجاز است." });
      return;
    }
    updateDraft("nationalIdPhoto", file);
    updateDraft("nationalIdPhotoPreview", URL.createObjectURL(file));
  }

  const displayNumber = contractNumber || buildContractNumber(contract.id);
  const displayDate = signedAt || formatPersianDate();

  return (
    <DashboardPage
      title="تکمیل و امضای قرارداد"
      subtitle={contract.title}
      action={
        <Button href="/dashboard/contracts" variant="outline" size="sm">
          انصراف
        </Button>
      }
    >
      {/* Steps */}
      <div className="mb-6 overflow-x-auto pb-1">
        <ol className="flex min-w-max items-center gap-2">
          {STEPS.map((item, index) => {
            const active = item.id === step;
            const done = index < stepIndex || step === "done";
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition",
                    active
                      ? "border-brand-300 bg-brand-50 text-brand-800"
                      : done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                {index < STEPS.length - 1 && <span className="text-slate-300">‹</span>}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Panel className="relative overflow-hidden">
          {step === "intro" && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-gradient-to-l from-brand-50 to-emerald-50 p-5 ring-1 ring-brand-100">
                <h2 className="font-display text-xl font-black text-slate-900">فرآیند واقعی عقد قرارداد</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  برای ثبت درخواست، باید مشخصات هویتی، تصویر کارت ملی و امضای دستی را تکمیل کنید.
                  در پایان، قرارداد رسمی A4 با سربرگ {SITE_CONFIG.name} ساخته و قابل دانلود می‌شود.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  "انتخاب پلن فروش (پایه، استاندارد یا ویژه)",
                  "پر کردن نام، کد ملی، شماره شناسنامه، موبایل و نشانی",
                  "بارگذاری عکس واضح از کارت ملی",
                  "مطالعه مفاد قرارداد و پذیرش شرایط",
                  "امضا داخل کادر مشخص‌شده در سامانه",
                  "ثبت درخواست و دانلود PDF رسمی",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === "plan" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">انتخاب پلن فروش</h2>
                <p className="mt-1 text-sm text-slate-500">
                  پلن انتخابی روی نرخ، حجم توافقی و متن قرارداد اثر می‌گذارد.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {CONTRACT_PLANS.map((plan) => {
                  const selected = draft.planId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => updateDraft("planId", plan.id)}
                      className={cn(
                        "relative flex h-full flex-col rounded-2xl border p-4 text-right transition",
                        selected
                          ? "border-brand-400 bg-brand-50/80 ring-2 ring-brand-500/25"
                          : "border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50",
                      )}
                    >
                      {plan.recommended ? (
                        <span className="absolute -top-2 left-3 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          پیشنهادی
                        </span>
                      ) : null}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-base font-black text-slate-900">{plan.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{plan.tagline}</p>
                        </div>
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-slate-300 bg-white",
                          )}
                        >
                          {selected ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                        </span>
                      </div>
                      <div className="mt-4 space-y-1.5 text-xs">
                        <p className="font-bold text-slate-800">{plan.rate}</p>
                        <p className="text-slate-600">حجم: {plan.volume}</p>
                        <p className="text-emerald-700">{plan.savings}</p>
                      </div>
                      <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-brand-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
              {errors.planId ? (
                <p className="text-sm font-medium text-rose-600">{errors.planId}</p>
              ) : null}
            </div>
          )}

          {step === "identity" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">مشخصات هویتی</h2>
              <p className="text-sm text-slate-500">این اطلاعات عیناً روی قرارداد و PDF درج می‌شود.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="نام و نام خانوادگی" error={errors.fullName} required>
                  <input
                    className={inputClass}
                    value={draft.fullName}
                    onChange={(e) => updateDraft("fullName", e.target.value)}
                    placeholder="مثلاً مهدی رضایی"
                  />
                </Field>
                <Field label="کد ملی" error={errors.nationalId} required>
                  <input
                    className={inputClass}
                    value={draft.nationalId}
                    onChange={(e) => updateDraft("nationalId", onlyDigits(e.target.value).slice(0, 10))}
                    placeholder="۱۰ رقم"
                    inputMode="numeric"
                    dir="ltr"
                  />
                </Field>
                <Field label="شماره شناسنامه" error={errors.birthCertificateNumber} required>
                  <input
                    className={inputClass}
                    value={draft.birthCertificateNumber}
                    onChange={(e) =>
                      updateDraft("birthCertificateNumber", onlyDigits(e.target.value).slice(0, 12))
                    }
                    placeholder="شماره شناسنامه"
                    inputMode="numeric"
                    dir="ltr"
                  />
                </Field>
                <Field label="شماره موبایل" error={errors.phone} required>
                  <input
                    className={inputClass}
                    value={draft.phone}
                    onChange={(e) => updateDraft("phone", onlyDigits(e.target.value).slice(0, 11))}
                    placeholder="09xxxxxxxxx"
                    inputMode="tel"
                    dir="ltr"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="نشانی کامل" error={errors.address} required>
                    <textarea
                      className={cn(inputClass, "min-h-[96px] resize-none")}
                      value={draft.address}
                      onChange={(e) => updateDraft("address", e.target.value)}
                      placeholder="استان، شهر، خیابان، پلاک..."
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === "id-photo" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">تصویر کارت ملی</h2>
              <p className="text-sm text-slate-500">
                عکس واضح از روی کارت ملی بگیرید یا فایل اسکن‌شده بارگذاری کنید. این تصویر به قرارداد پیوست می‌شود.
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 px-4 py-10 transition hover:border-brand-400 hover:bg-brand-50">
                <Camera className="h-8 w-8 text-brand-600" />
                <span className="text-sm font-bold text-brand-800">انتخاب یا گرفتن عکس کارت ملی</span>
                <span className="text-xs text-slate-500">JPG / PNG / WebP · حداکثر ۵ مگابایت</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                />
              </label>
              {errors.nationalIdPhoto && (
                <p className="text-sm font-medium text-rose-600">{errors.nationalIdPhoto}</p>
              )}
              {draft.nationalIdPhotoPreview && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={draft.nationalIdPhotoPreview}
                    alt="پیش‌نمایش کارت ملی"
                    className="mx-auto max-h-64 rounded-xl object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => onPhotoChange(null)}
                    className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    حذف تصویر
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">بررسی متن قرارداد</h2>
              <p className="text-sm text-slate-500">
                پیش‌نمایش رسمی با سربرگ {SITE_CONFIG.name} را بخوانید. بعد از پذیرش، مرحله امضا باز می‌شود.
              </p>
              <div className="max-h-[28rem] overflow-auto rounded-2xl border border-slate-200 bg-slate-100/80 p-3">
                <div className="origin-top scale-[0.55] sm:scale-[0.62]" style={{ width: 794 }}>
                  <ContractDocumentPreview
                    contract={contract}
                    party={partyPreview}
                    contractNumber={displayNumber}
                    signedAt={displayDate}
                    nationalIdPhotoUrl={draft.nationalIdPhotoPreview}
                    signatureDataUrl={draft.signatureDataUrl}
                    resolved={{
                      startDate:
                        contract.startDate === "—" ? displayDate : contract.startDate,
                      endDate: contract.endDate === "—" ? "یک سال پس از امضا" : contract.endDate,
                      volume: selectedPlan.volume,
                      rate: selectedPlan.rate,
                      planName: selectedPlan.name,
                    }}
                  />
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={draft.acceptedTerms}
                  onChange={(e) => updateDraft("acceptedTerms", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm leading-7 text-slate-700">
                  مفاد قرارداد، نرخ فصلی، تعهدات طرفین و شرایط پرداخت را خواندم و می‌پذیرم. اطلاعات هویتی
                  واردشده صحیح است.
                </span>
              </label>
              {errors.acceptedTerms && (
                <p className="text-sm font-medium text-rose-600">{errors.acceptedTerms}</p>
              )}
            </div>
          )}

          {step === "signature" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">امضای الکترونیکی</h2>
              <p className="text-sm text-slate-500">
                فقط داخل کادر زیر امضا کنید. همین امضا در محل مشخص‌شده روی قرارداد A4 قرار می‌گیرد.
              </p>
              <SignaturePad
                value={draft.signatureDataUrl}
                onChange={(url) => updateDraft("signatureDataUrl", url)}
              />
              {errors.signature && (
                <p className="text-sm font-medium text-rose-600">{errors.signature}</p>
              )}
              {submitError && <p className="text-sm font-medium text-rose-600">{submitError}</p>}
            </div>
          )}

          {step === "done" && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black text-slate-900">درخواست قرارداد ثبت شد</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  قرارداد رسمی با شماره {contractNumber} فعال شد. می‌توانید PDF سربرگ‌دار را دانلود کنید.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => {
                    if (!pdfBlob) return;
                    triggerDownload(pdfBlob, `قرارداد-${SITE_CONFIG.name}-${contract.id}.pdf`);
                  }}
                  disabled={!pdfBlob}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  دانلود PDF قرارداد
                </Button>
                <Button href={`/dashboard/contracts/${contract.id}`} variant="outline" size="lg">
                  مشاهده در قراردادها
                </Button>
              </div>
            </div>
          )}

          {step !== "done" && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={goBack}
                disabled={step === "intro" || submitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40"
              >
                <ArrowRight className="h-4 w-4" />
                قبلی
              </button>
              <Button type="button" onClick={() => void goNext()} disabled={submitting} className="gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ساخت قرارداد...
                  </>
                ) : step === "signature" ? (
                  <>
                    ثبت و صدور قرارداد
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    ادامه
                    <ArrowLeft className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </Panel>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">خلاصه قرارداد</p>
            <p className="mt-2 font-bold text-slate-900">{contract.title}</p>
            <dl className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between gap-2">
                <dt>نوع</dt>
                <dd className="font-semibold text-slate-800">{contract.type}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>پلن</dt>
                <dd className="font-semibold text-slate-800">{selectedPlan.name}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>نرخ</dt>
                <dd className="font-semibold text-slate-800">{selectedPlan.rate}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>حجم</dt>
                <dd className="font-semibold text-slate-800">{selectedPlan.volume}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm leading-7 text-brand-900">
            <p className="font-bold">نکته امنیتی</p>
            <p className="mt-1 text-brand-800/80">
              تصویر کارت ملی و امضا فقط برای صدور همین قرارداد استفاده می‌شود و در فضای مرورگر شما
              ذخیره می‌گردد (نسخه دموی فرانت‌اند).
            </p>
          </div>
          <Link
            href={`/dashboard/contracts/${contract.id}`}
            className="block text-center text-xs font-semibold text-slate-500 hover:text-brand-700"
          >
            بازگشت به جزئیات قرارداد
          </Link>
        </aside>
      </div>
    </DashboardPage>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
