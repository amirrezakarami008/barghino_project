"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Alert, Button } from "@/components/ui";
import {
  hasBirthCertificateForSigning,
  isProfileIdentityComplete,
} from "@/features/auth/lib/identity-completion";
import { useAuth } from "@/features/auth/session-provider";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/cn";
import { ContractError } from "./contract-ui";
import {
  buildContractDocumentText,
  CONTRACT_TERMS_VERSION,
  sha256Hex,
} from "./contract-document";
import {
  contractError,
  getContract,
  mutationMayHaveSucceeded,
  nationalIdMaxBytes,
  signContract,
  signatureMaxBytes,
  uploadNationalIdFile,
  uploadSignature,
  uploadSignedPdf,
  type SignatureFile,
  type UploadedPrivateFile,
} from "./contracts-api";
import type { Contract } from "./contract-model";
import { IdentityNotice } from "./identity-notice";

const SignaturePad = dynamic(() => import("./signature-pad").then((module) => module.SignaturePad), {
  loading: () => <p role="status">در حال آماده‌سازی ابزار امضا…</p>,
});

type Evidence =
  | { readonly status: "empty" }
  | { readonly status: "ready"; readonly blob: Blob }
  | { readonly status: "uploading"; readonly blob: Blob }
  | { readonly status: "uploaded"; readonly blob: Blob; readonly file: SignatureFile }
  | { readonly status: "error"; readonly blob: Blob; readonly message: string; readonly uncertain: boolean };

type Attachment =
  | { readonly status: "empty" }
  | { readonly status: "ready"; readonly file: File }
  | { readonly status: "uploading"; readonly file: File }
  | { readonly status: "uploaded"; readonly file: File; readonly uploaded: UploadedPrivateFile }
  | { readonly status: "error"; readonly file: File; readonly message: string; readonly uncertain: boolean };

type SignState =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "error"; readonly message: string; readonly uncertain: boolean };

export function ContractSignature({
  contract,
  onServerChange,
}: {
  readonly contract: Contract;
  readonly onServerChange: (contract: Contract) => void;
}): ReactElement {
  const { profile } = useAuth();
  const identityComplete = isProfileIdentityComplete(profile);
  const hasBirthCertificate = hasBirthCertificateForSigning(profile);
  const documentText = buildContractDocumentText(contract);
  const termsId = useId();
  const [accepted, setAccepted] = useState(false);
  const [evidence, setEvidence] = useState<Evidence>({ status: "empty" });
  const [nationalId, setNationalId] = useState<Attachment>({ status: "empty" });
  const [signedPdf, setSignedPdf] = useState<Attachment>({ status: "empty" });
  const [signState, setSignState] = useState<SignState>({ status: "idle" });
  const [hashState, setHashState] = useState<
    | { readonly status: "ready"; readonly hash: string; readonly forText: string }
    | { readonly status: "error"; readonly forText: string }
    | { readonly status: "idle" }
  >({ status: "idle" });
  const documentHash = hashState.status === "ready" && hashState.forText === documentText ? hashState.hash : "";
  const hashError = hashState.status === "error" && hashState.forText === documentText;
  const hashPending = !documentHash && !hashError;
  const inFlight = useRef(false);
  const dirty =
    evidence.status === "ready" ||
    evidence.status === "error" ||
    evidence.status === "uploading" ||
    nationalId.status === "ready" ||
    nationalId.status === "error" ||
    nationalId.status === "uploading" ||
    signedPdf.status === "ready" ||
    signedPdf.status === "error" ||
    signedPdf.status === "uploading" ||
    signState.status === "submitting";

  useEffect(() => {
    let active = true;
    void sha256Hex(documentText)
      .then((hash) => {
        if (!active) return;
        if (!/^[0-9a-f]{64}$/i.test(hash)) {
          setHashState({ status: "error", forText: documentText });
          return;
        }
        setHashState({ status: "ready", hash: hash.toLowerCase(), forText: documentText });
      })
      .catch(() => {
        if (active) setHashState({ status: "error", forText: documentText });
      });
    return () => {
      active = false;
    };
  }, [documentText]);

  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault();
    }
    function guardClick(event: MouseEvent): void {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.origin !== location.origin ||
        link.pathname === location.pathname ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        link.target === "_blank"
      ) {
        return;
      }
      if (!window.confirm("مدارک یا امضای ذخیره‌نشده دارید. از این صفحه خارج می‌شوید؟")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", guardClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", guardClick, true);
    };
  }, [dirty]);

  async function ensureSignatureUploaded(): Promise<SignatureFile | null> {
    if (evidence.status === "uploaded") return evidence.file;
    if (evidence.status !== "ready" && !(evidence.status === "error" && !evidence.uncertain)) return null;
    const blob = evidence.blob;
    setEvidence({ status: "uploading", blob });
    try {
      const latest = await getContract(contract.uuid);
      if (latest.status !== "draft") {
        onServerChange(latest);
        return null;
      }
      const file = await uploadSignature(blob);
      setEvidence({ status: "uploaded", blob, file });
      return file;
    } catch (error) {
      setEvidence({
        status: "error",
        blob,
        message: contractError(error),
        uncertain: mutationMayHaveSucceeded(error),
      });
      return null;
    }
  }

  async function ensureAttachmentUploaded(
    attachment: Attachment,
    setAttachment: (value: Attachment) => void,
    upload: (file: File) => Promise<UploadedPrivateFile>,
  ): Promise<UploadedPrivateFile | null> {
    if (attachment.status === "uploaded") return attachment.uploaded;
    if (attachment.status !== "ready" && !(attachment.status === "error" && !attachment.uncertain)) return null;
    const file = attachment.file;
    setAttachment({ status: "uploading", file });
    try {
      const uploaded = await upload(file);
      setAttachment({ status: "uploaded", file, uploaded });
      return uploaded;
    } catch (error) {
      setAttachment({
        status: "error",
        file,
        message: contractError(error),
        uncertain: mutationMayHaveSucceeded(error),
      });
      return null;
    }
  }

  async function submitSign(): Promise<void> {
    if (inFlight.current || !accepted || !identityComplete || !hasBirthCertificate || !documentHash) return;
    if (evidence.status === "empty" || evidence.status === "uploading") return;
    if (nationalId.status === "empty" || nationalId.status === "uploading") return;
    if (signedPdf.status === "empty" || signedPdf.status === "uploading") return;
    if (evidence.status === "error" && evidence.uncertain) return;
    if (nationalId.status === "error" && nationalId.uncertain) return;
    if (signedPdf.status === "error" && signedPdf.uncertain) return;

    inFlight.current = true;
    setSignState({ status: "submitting" });
    try {
      const latestBefore = await getContract(contract.uuid);
      if (latestBefore.status !== "draft") {
        onServerChange(latestBefore);
        return;
      }

      const signature = await ensureSignatureUploaded();
      if (!signature) {
        setSignState({ status: "idle" });
        return;
      }
      const nationalIdFile = await ensureAttachmentUploaded(nationalId, setNationalId, uploadNationalIdFile);
      if (!nationalIdFile) {
        setSignState({ status: "idle" });
        return;
      }
      const pdfFile = await ensureAttachmentUploaded(signedPdf, setSignedPdf, uploadSignedPdf);
      if (!pdfFile) {
        setSignState({ status: "idle" });
        return;
      }

      const latest = await getContract(contract.uuid);
      if (latest.status !== "draft") {
        onServerChange(latest);
        return;
      }

      const signed = await signContract(contract.uuid, {
        acceptedTerms: true,
        termsVersion: CONTRACT_TERMS_VERSION,
        termsSha256: documentHash,
        signatureFileUuid: signature.uuid,
        nationalIdFileUuid: nationalIdFile.uuid,
        signedPdfFileUuid: pdfFile.uuid,
      });
      onServerChange(signed);
    } catch (error) {
      setSignState({
        status: "error",
        message: contractError(error),
        uncertain: mutationMayHaveSucceeded(error),
      });
    } finally {
      inFlight.current = false;
      setSignState((current) => (current.status === "submitting" ? { status: "idle" } : current));
    }
  }

  const busy =
    evidence.status === "uploading" ||
    nationalId.status === "uploading" ||
    signedPdf.status === "uploading" ||
    signState.status === "submitting";

  const hasSignature =
    evidence.status === "ready" ||
    evidence.status === "uploaded" ||
    (evidence.status === "error" && !evidence.uncertain);
  const hasNationalId =
    nationalId.status === "ready" ||
    nationalId.status === "uploaded" ||
    (nationalId.status === "error" && !nationalId.uncertain);
  const hasPdf =
    signedPdf.status === "ready" ||
    signedPdf.status === "uploaded" ||
    (signedPdf.status === "error" && !signedPdf.uncertain);
  const documentReady = Boolean(documentHash) && !hashError;

  const canSubmit =
    identityComplete &&
    hasBirthCertificate &&
    accepted &&
    documentReady &&
    hasSignature &&
    hasNationalId &&
    hasPdf &&
    !busy &&
    !(signState.status === "error" && signState.uncertain);

  const missingHints: string[] = [];
  if (!identityComplete) missingHints.push("تکمیل هویت در پروفایل");
  if (!hasBirthCertificate) missingHints.push("شماره شناسنامه در پروفایل");
  if (!documentReady) missingHints.push("آماده‌شدن سند");
  if (!hasSignature) missingHints.push("تصویر امضا");
  if (!hasNationalId) missingHints.push("کارت ملی");
  if (!hasPdf) missingHints.push("PDF امضاشده");
  if (!accepted) missingHints.push("پذیرش شرایط");

  return (
    <section className="contract-sign-panel" aria-labelledby="contract-sign-heading">
      <header className="contract-sign-header">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint text-primary">
            <Icon name="edit" className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id="contract-sign-heading" className="text-h3 tracking-tight">
              امضای قرارداد
            </h2>
            <p className="mt-1 text-sm leading-7 text-foreground-muted">
              سند را بخوانید، مدارک را بفرستید و ارسال کنید.
            </p>
          </div>
        </div>
      </header>

      <IdentityNotice />

      <SignStep
        index={1}
        title="خواندن سند شرایط"
        hint="متن را مرور کنید؛ نسخهٔ نمایش‌داده‌شده مبنای امضاست."
        done={documentReady}
      >
        <article className="contract-document-sheet" aria-label="متن سند قرارداد">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">متن قرارداد</h3>
            <p className="rounded-full bg-surface px-3 py-1 text-caption font-semibold text-foreground-muted">
              نسخه · <bdi dir="ltr">{CONTRACT_TERMS_VERSION}</bdi>
            </p>
          </header>
          <pre className="contract-document-body" dir="rtl">
            {documentText}
          </pre>
          <p
            className={cn(
              "mt-3 text-caption",
              hashError ? "text-danger" : "text-foreground-muted",
            )}
            role="status"
          >
            {hashError
              ? "آماده‌سازی سند برای امضا انجام نشد. صفحه را تازه کنید."
              : hashPending
                ? "در حال آماده‌سازی سند…"
                : "سند آمادهٔ امضاست."}
          </p>
        </article>
      </SignStep>

      <SignStep
        index={2}
        title="امضا و بارگذاری مدارک"
        hint="ابتدا امضا، سپس کارت ملی و PDF قرارداد امضاشده."
        done={hasSignature && hasNationalId && hasPdf}
      >
        <div className="contract-signature-workspace">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">۲‑۱ · تصویر امضا</p>
            {hasSignature ? (
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-emerald">
                <Icon name="check" className="size-3.5" />
                آماده
              </span>
            ) : (
              <span className="text-caption text-foreground-muted">روی صفحه بکشید یا تصویر بفرستید</span>
            )}
          </div>
          <SignaturePad
            disabled={busy}
            onChange={(blob) => setEvidence(blob ? { status: "ready", blob } : { status: "empty" })}
          />
          {evidence.status === "error" ? (
            <div className="mt-3">
              <ContractError
                message={
                  evidence.uncertain
                    ? "نتیجهٔ ذخیرهٔ فایل مشخص نیست. برای جلوگیری از فایل تکراری، دوباره ارسال نکنید."
                    : evidence.message
                }
              />
            </div>
          ) : null}
          {evidence.status === "uploaded" ? (
            <p role="status" className="mt-3 flex items-center gap-2 text-sm text-foreground-muted">
              <Icon name="check" className="size-4" />
              تصویر امضا آپلود شد.
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <AttachmentField
            stepLabel="۲‑۲"
            label="تصویر کارت ملی"
            hint="PNG، JPEG، WebP یا PDF · حداکثر ۱۰ مگابایت"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            attachment={nationalId}
            disabled={busy}
            onChange={setNationalId}
            validate={(file) => {
              const ok = ["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type);
              if (!ok || file.size === 0 || file.size > nationalIdMaxBytes) {
                return "کارت ملی باید PNG، JPEG، WebP یا PDF و حداکثر ۱۰ مگابایت باشد.";
              }
              return null;
            }}
          />
          <AttachmentField
            stepLabel="۲‑۳"
            label="PDF امضاشده قرارداد"
            hint="فقط PDF · حداکثر ۱۵ مگابایت"
            accept="application/pdf"
            attachment={signedPdf}
            disabled={busy}
            onChange={setSignedPdf}
            validate={(file) => {
              if (file.type !== "application/pdf" || file.size === 0 || file.size > signatureMaxBytes) {
                return "فایل قرارداد امضاشده باید PDF و حداکثر ۱۵ مگابایت باشد.";
              }
              return null;
            }}
          />
        </div>
      </SignStep>

      <SignStep
        index={3}
        title="پذیرش و ارسال برای بررسی"
        hint="پس از ارسال، وضعیت به «در انتظار بررسی شرکت» تغییر می‌کند."
        done={accepted && canSubmit}
      >
        {signState.status === "error" ? (
          <Alert tone={signState.uncertain ? "warning" : "danger"} title="امضا ثبت نشد" className="mb-4">
            {signState.uncertain
              ? "نتیجهٔ ارسال مشخص نیست. وضعیت قرارداد را تازه کنید؛ از ارسال دوباره خودداری کنید مگر پس از بررسی."
              : signState.message}
          </Alert>
        ) : null}

        <label htmlFor={termsId} className="contract-sign-accept">
          <input
            id={termsId}
            type="checkbox"
            className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
            checked={accepted}
            disabled={busy || !identityComplete}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>
            شرایط سند نمایش‌داده‌شده با نسخه{" "}
            <bdi dir="ltr">{CONTRACT_TERMS_VERSION}</bdi> را می‌پذیرم و درخواست بررسی شرکت را ارسال می‌کنم.
          </span>
        </label>
      </SignStep>

      <div className="contract-sign-cta" role="region" aria-label="ارسال امضا">
        <div className="min-w-0">
          <p className="text-sm font-bold">ثبت نهایی امضا</p>
          <p className="mt-1 text-caption leading-6 text-foreground-muted">
            {!canSubmit && missingHints.length
              ? `باقی‌مانده: ${missingHints.slice(0, 3).join(" · ")}${missingHints.length > 3 ? "…" : ""}`
              : "همهٔ موارد آماده است؛ ارسال کنید."}
          </p>
        </div>
        <Button
          className="contract-sign-cta-button"
          disabled={!canSubmit}
          loading={signState.status === "submitting"}
          onClick={() => {
            void submitSign();
          }}
          startIcon={<Icon name="check" className="size-4" />}
        >
          ثبت امضا و ارسال برای بررسی
        </Button>
      </div>
    </section>
  );
}

function SignStep({
  index,
  title,
  hint,
  done,
  children,
}: {
  readonly index: number;
  readonly title: string;
  readonly hint: string;
  readonly done: boolean;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <section className={cn("contract-sign-step", done && "contract-sign-step--done")}>
      <header className="contract-sign-step-head">
        <span className="contract-sign-step-index" aria-hidden>
          {done ? <Icon name="check" className="size-4" /> : index}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-6">{title}</h3>
          <p className="mt-0.5 text-caption leading-6 text-foreground-muted">{hint}</p>
        </div>
      </header>
      <div className="contract-sign-step-body">{children}</div>
    </section>
  );
}

function AttachmentField({
  stepLabel,
  label,
  hint,
  accept,
  attachment,
  disabled,
  onChange,
  validate,
}: {
  readonly stepLabel: string;
  readonly label: string;
  readonly hint: string;
  readonly accept: string;
  readonly attachment: Attachment;
  readonly disabled: boolean;
  readonly onChange: (value: Attachment) => void;
  readonly validate: (file: File) => string | null;
}): ReactElement {
  const inputId = useId();
  const selectedName = attachment.status === "empty" ? "" : attachment.file.name;

  function choose(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      onChange({ status: "empty" });
      return;
    }
    const message = validate(file);
    if (message) {
      onChange({ status: "error", file, message, uncertain: false });
      return;
    }
    onChange({ status: "ready", file });
  }

  return (
    <div
      className={cn(
        "contract-attachment",
        (attachment.status === "ready" || attachment.status === "uploaded") && "contract-attachment--ready",
        attachment.status === "error" && "contract-attachment--error",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-caption font-bold text-foreground-muted">{stepLabel}</p>
          <label htmlFor={inputId} className="mt-1 block text-sm font-semibold">
            {label}
          </label>
        </div>
        {attachment.status === "uploaded" || attachment.status === "ready" ? (
          <span className="inline-flex items-center gap-1 text-caption font-semibold text-emerald">
            <Icon name="check" className="size-3.5" />
            انتخاب شد
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-caption leading-6 text-foreground-muted">{hint}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="contract-image-upload">
          {selectedName ? "تغییر فایل" : "انتخاب فایل"}
          <input
            id={inputId}
            className="sr-only"
            type="file"
            accept={accept}
            disabled={disabled}
            onChange={choose}
          />
        </label>
        {attachment.status === "uploading" ? (
          <span className="text-caption text-foreground-muted">در حال آپلود…</span>
        ) : null}
      </div>
      {selectedName ? (
        <p className="mt-2 break-all text-caption text-foreground-muted" dir="ltr">
          {selectedName}
        </p>
      ) : null}
      {attachment.status === "error" ? (
        <p className="contract-field-error" role="alert">
          {attachment.uncertain
            ? "نتیجهٔ آپلود مشخص نیست؛ دوباره ارسال نکنید مگر پس از بررسی."
            : attachment.message}
        </p>
      ) : null}
    </div>
  );
}
