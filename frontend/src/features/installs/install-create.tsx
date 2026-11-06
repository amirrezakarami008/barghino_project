"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ButtonLink,
  ConfirmDialog,
  Input,
  Textarea,
  useToast,
} from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { isIranMobile, normalizeIranMobile } from "@/features/auth/lib/phone";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/cn";
import { faNumber } from "@/shared/lib/fa";
import {
  attachInstallMedia,
  createInstallRequest,
  installError,
  installImageTypes,
  installMediaMaxBytes,
  mutationMayHaveSucceeded,
  submitInstallRequest,
  uploadInstallMedia,
} from "./installs-api";
import { formatBytes } from "./install-model";
import "./installs-workspace.css";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

type LocalImage = {
  readonly id: string;
  readonly file: File;
  readonly previewUrl: string;
  status: "ready" | "uploading" | "attached" | "error";
  error?: string;
  storedFileUuid?: string;
  mediaUuid?: string;
};

type FormErrors = {
  address?: string;
  phone?: string;
  areaM2?: string;
};

function normalizeAreaInput(value: string): string {
  const latin = value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "");
  const parts = latin.split(".");
  if (parts.length <= 1) return latin;
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

function parseAreaM2(raw: string): number | null {
  const normalized = normalizeAreaInput(raw.trim());
  if (!normalized || normalized === ".") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

function validate(address: string, phone: string, areaM2: string): FormErrors {
  const errors: FormErrors = {};
  if (!address.trim()) errors.address = "نشانی محل نصب الزامی است.";
  else if (address.trim().length < 8) errors.address = "نشانی را کامل‌تر وارد کنید.";
  if (!phone.trim()) errors.phone = "شماره تماس الزامی است.";
  else if (!isIranMobile(phone)) errors.phone = "شماره موبایل معتبر ایرانی وارد کنید.";
  if (!areaM2.trim()) errors.areaM2 = "مساحت نصب الزامی است.";
  else if (parseAreaM2(areaM2) === null) errors.areaM2 = "مساحت باید عددی مثبت باشد.";
  return errors;
}

export function InstallCreate(): ReactElement {
  return <InstallCreateForm />;
}

function InstallCreateForm(): ReactElement {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { push: toast } = useToast();
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<LocalImage[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"idle" | "creating" | "uploading" | "submitting">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createdUuid, setCreatedUuid] = useState<string | null>(null);

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
      };

  function markTouched(field: string) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function revalidate(next = { address, phone, areaM2 }) {
    const nextErrors = validate(next.address, next.phone, next.areaM2);
    setErrors(nextErrors);
    return nextErrors;
  }

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const next: LocalImage[] = [];
    for (const file of incoming) {
      if (!installImageTypes.includes(file.type as (typeof installImageTypes)[number])) {
        toast({ tone: "danger", title: "فقط JPEG، PNG یا WebP مجاز است." });
        continue;
      }
      if (file.size === 0 || file.size > installMediaMaxBytes) {
        toast({ tone: "danger", title: "حجم تصویر حداکثر ۲۵ مگابایت باشد." });
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "ready",
      });
    }
    if (next.length) setImages((current) => [...current, ...next].slice(0, 12));
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  }

  async function runSubmit(shouldSubmit: boolean) {
    const nextErrors = revalidate();
    setTouched({ address: true, phone: true, areaM2: true });
    if (Object.keys(nextErrors).length) {
      setFormError("لطفاً فیلدهای الزامی را اصلاح کنید.");
      return;
    }
    if (busy) return;

    setBusy(true);
    setFormError(null);
    try {
      let requestUuid = createdUuid;
      let stage = "";
      if (!requestUuid) {
        setPhase("creating");
        const created = await createInstallRequest({
          address: address.trim(),
          phone: normalizeIranMobile(phone),
          areaM2: normalizeAreaInput(areaM2),
          note: note.trim(),
        });
        requestUuid = created.uuid;
        stage = created.stage;
        setCreatedUuid(created.uuid);
        toast({
          tone: "success",
          title: created.stage === "draft" ? "پیش‌نویس درخواست ساخته شد." : "درخواست نصب ثبت شد.",
        });
      }

      const pending = images.filter((item) => item.status === "ready" || item.status === "error");
      if (pending.length) {
        setPhase("uploading");
        for (const item of pending) {
          setImages((current) =>
            current.map((row) => (row.id === item.id ? { ...row, status: "uploading", error: undefined } : row)),
          );
          try {
            const uploaded = await uploadInstallMedia(item.file);
            const media = await attachInstallMedia(requestUuid, uploaded.uuid);
            setImages((current) =>
              current.map((row) =>
                row.id === item.id
                  ? { ...row, status: "attached", storedFileUuid: uploaded.uuid, mediaUuid: media.uuid }
                  : row,
              ),
            );
          } catch (error) {
            const message = installError(error);
            setImages((current) =>
              current.map((row) => (row.id === item.id ? { ...row, status: "error", error: message } : row)),
            );
            // Request already exists — don't block navigation with a hard failure after create.
            setFormError(`درخواست ثبت شد ولی تصویر «${item.file.name}» پیوست نشد. ${message}`);
            router.push(`/panel/install/${encodeURIComponent(requestUuid)}`);
            return;
          }
        }
      }

      if (!shouldSubmit || stage === "submitted") {
        if (shouldSubmit && stage === "submitted") {
          toast({ tone: "success", title: "درخواست نصب ارسال شد." });
        } else if (!shouldSubmit) {
          toast({ tone: "info", title: stage === "draft" ? "پیش‌نویس ذخیره شد." : "درخواست ذخیره شد." });
        }
        router.push(`/panel/install/${encodeURIComponent(requestUuid)}`);
        return;
      }

      setPhase("submitting");
      const submitted = await submitInstallRequest(requestUuid);
      toast({ tone: "success", title: "درخواست نصب ارسال شد." });
      router.push(`/panel/install/${encodeURIComponent(submitted.uuid)}`);
    } catch (error) {
      if (mutationMayHaveSucceeded(error)) {
        setFormError(
          "پاسخ سرور نامشخص است. فهرست درخواست‌ها را تازه‌سازی کنید تا از ثبت تکراری جلوگیری شود.",
        );
      } else {
        setFormError(installError(error));
      }
    } finally {
      setBusy(false);
      setPhase("idle");
      setConfirmOpen(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setConfirmOpen(true);
  }

  const phaseLabel =
    phase === "creating"
      ? "در حال ایجاد پیش‌نویس…"
      : phase === "uploading"
        ? "در حال آپلود تصاویر…"
        : phase === "submitting"
          ? "در حال ارسال درخواست…"
          : "ارسال نهایی درخواست";

  return (
    <motion.form className="installs-workspace mx-auto max-w-5xl" onSubmit={onSubmit} {...motionProps}>
      <motion.div className="installs-page-header" variants={reduceMotion ? undefined : fadeUp}>
        <Link
          href="/panel/install"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground-muted hover:text-foreground"
        >
          <Icon name="arrow" className="size-4" />
          بازگشت به فهرست
        </Link>
      </motion.div>

      <motion.section className="installs-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div>
          <p className="installs-hero-eyebrow">گام‌به‌گام و مطمئن</p>
          <h2 className="installs-hero-title">ثبت درخواست نصب نیروگاه</h2>
          <p className="installs-hero-body">
            ابتدا پیش‌نویس ساخته می‌شود، تصاویر محل پیوست می‌شوند و فقط با تأیید شما درخواست ارسال می‌گردد.
          </p>
        </div>
        <div className="installs-hero-art">
          <PanelArt name="installs/document" width={280} height={280} className="installs-hero-image" />
        </div>
      </motion.section>

      {formError ? (
        <Alert tone="danger" title="ارسال کامل نشد">
          {formError}
        </Alert>
      ) : null}

      <motion.section className="installs-section" variants={reduceMotion ? undefined : fadeUp}>
        <div className="installs-section-head">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">محل و اطلاعات تماس</h3>
            <p className="mt-1 text-sm leading-7 text-foreground-muted">
              نشانی دقیق، شماره تماس در دسترس و مساحت قابل‌نصب را وارد کنید.
            </p>
          </div>
          <PanelArt name="installs/location" width={88} height={88} className="installs-section-art" />
        </div>
        <div className="installs-field-grid">
          <Input
            label="نشانی محل نصب"
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              if (touched.address) revalidate({ address: event.target.value, phone, areaM2 });
            }}
            onBlur={() => {
              markTouched("address");
              revalidate();
            }}
            error={touched.address ? errors.address : undefined}
            placeholder="مثلاً تهران، خیابان ولیعصر، پلاک …"
            required
            autoComplete="street-address"
          />
          <div className="installs-field-grid installs-field-grid--two">
            <Input
              label="شماره موبایل"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                if (touched.phone) revalidate({ address, phone: event.target.value, areaM2 });
              }}
              onBlur={() => {
                markTouched("phone");
                revalidate();
              }}
              error={touched.phone ? errors.phone : undefined}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              inputMode="tel"
              required
              autoComplete="tel"
              dir="ltr"
              className="text-start"
            />
            <Input
              label="مساحت نصب (متر مربع)"
              value={areaM2}
              onChange={(event) => {
                const next = normalizeAreaInput(event.target.value);
                setAreaM2(next);
                if (touched.areaM2) revalidate({ address, phone, areaM2: next });
              }}
              onBlur={() => {
                markTouched("areaM2");
                revalidate();
              }}
              error={touched.areaM2 ? errors.areaM2 : undefined}
              placeholder="مثلاً ۴۵"
              inputMode="decimal"
              required
              dir="ltr"
            />
          </div>
        </div>
      </motion.section>

      <motion.section className="installs-section" variants={reduceMotion ? undefined : fadeUp}>
        <div className="installs-section-head">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">توضیحات تکمیلی</h3>
            <p className="mt-1 text-sm leading-7 text-foreground-muted">
              جزئیاتی مثل نوع سقف، سایه، یا محدودیت دسترسی را بنویسید (اختیاری).
            </p>
          </div>
        </div>
        <Textarea
          label="یادداشت"
          value={note}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNote(event.target.value.slice(0, 2000))}
          helperText={`${faNumber(note.length)} از ۲۰۰۰ نویسه`}
          rows={4}
          placeholder="مثلاً سقف شیروانی جنوبی، دسترسی از حیاط خلوت…"
        />
      </motion.section>

      <motion.section className="installs-section" variants={reduceMotion ? undefined : fadeUp}>
        <div className="installs-section-head">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">تصاویر محل نصب</h3>
            <p className="mt-1 text-sm leading-7 text-foreground-muted">
              سقف، نمای ساختمان، محل پیشنهادی پنل و تابلو برق را پیوست کنید.
            </p>
          </div>
          <PanelArt name="installs/upload" width={88} height={88} className="installs-section-art" />
        </div>

        <div className="installs-upload">
          <label
            htmlFor={fileInputId}
            className={cn("installs-dropzone", dragActive && "installs-dropzone--active")}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            <PanelArt name="installs/upload" width={80} height={80} className="installs-dropzone-art" />
            <p className="text-sm font-bold">تصاویر را بکشید و رها کنید یا انتخاب کنید</p>
            <p className="text-caption text-foreground-muted">JPEG / PNG / WebP · حداکثر ۲۵ مگابایت</p>
          </label>
          <input
            ref={fileRef}
            id={fileInputId}
            type="file"
            accept={installImageTypes.join(",")}
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.length) addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {images.length ? (
            <ul className="installs-media-grid">
              {images.map((item) => (
                <li key={item.id}>
                  <figure className="installs-media-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt={item.file.name} />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="installs-media-remove"
                      disabled={busy || item.status === "uploading"}
                      onClick={() => removeImage(item.id)}
                    >
                      حذف
                    </Button>
                    <figcaption>
                      <p className="truncate text-xs font-bold">{item.file.name}</p>
                      <p className="text-caption text-foreground-muted">{formatBytes(item.file.size)}</p>
                      <p className="text-caption font-semibold">
                        {item.status === "ready"
                          ? "آماده آپلود"
                          : item.status === "uploading"
                            ? "در حال آپلود…"
                            : item.status === "attached"
                              ? "پیوست شد"
                              : item.error || "خطا"}
                      </p>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </motion.section>

      <motion.div className="installs-sticky-actions" variants={reduceMotion ? undefined : fadeUp}>
        <ButtonLink href="/panel/install" variant="secondary">
          انصراف
        </ButtonLink>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void runSubmit(false)}
          >
            ذخیره پیش‌نویس
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? phaseLabel : "ارسال نهایی درخواست"}
          </Button>
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        title="ارسال نهایی درخواست؟"
        description="پس از ارسال، تغییر تصاویر و ویرایش پیش‌نویس از این مسیر ممکن نیست. از کامل بودن اطلاعات مطمئن هستید؟"
        confirmLabel={busy ? phaseLabel : "بله، ارسال شود"}
        cancelLabel="بازگشت به ویرایش"
        pending={busy}
        onClose={() => !busy && setConfirmOpen(false)}
        onConfirm={() => void runSubmit(true)}
      />
    </motion.form>
  );
}
