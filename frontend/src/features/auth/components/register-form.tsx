"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { OtpInput } from "@/features/auth/components/otp-input";
import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { isCompanyNationalId, isNationalId } from "@/features/auth/lib/identity";
import { digitsOnly, formatIranMobile, isIranMobile, normalizeIranMobile } from "@/features/auth/lib/phone";
import { userFromApi, type Session } from "@/features/auth/lib/session";
import { destinationFor, useAuth } from "@/features/auth/session-provider";
import { faNumber } from "@/shared/lib/fa";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";
import "./auth-face.css";

const codeLifetimeSeconds = 120;

type AccountType = "individual" | "legal";
type Path = "sell" | "install";
type ApiStep = "details" | "code";
type WizardStep = 1 | 2 | 3;

type Draft = {
  accountType: AccountType;
  path: Path;
  phone: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  companyName: string;
  companyNationalId: string;
  representativeFirstName: string;
  representativeLastName: string;
  representativeNationalId: string;
  registrationNumber: string;
  economicCode: string;
  terms: boolean;
};

const fieldErrorKeys: Partial<Record<keyof Draft, string>> = {
  phone: "phone",
  firstName: "first_name",
  lastName: "last_name",
  nationalId: "national_id",
  companyName: "company_name",
  companyNationalId: "company_national_id",
  representativeFirstName: "representative_first_name",
  representativeLastName: "representative_last_name",
  representativeNationalId: "representative_national_id",
  registrationNumber: "registration_number",
  economicCode: "economic_code",
  terms: "terms_accepted",
};

const individualErrorKeys = ["first_name", "firstName", "last_name", "lastName", "national_id", "nationalId"] as const;
const legalErrorKeys = [
  "company_name",
  "companyName",
  "company_national_id",
  "companyNationalId",
  "representative_first_name",
  "representative_last_name",
  "representative_national_id",
  "registration_number",
  "economic_code",
] as const;
const contactErrorKeys = ["phone", "terms_accepted", "terms"] as const;

const fieldLabels: Record<string, string> = {
  first_name: "نام",
  firstName: "نام",
  last_name: "نام خانوادگی",
  lastName: "نام خانوادگی",
  national_id: "کد ملی",
  nationalId: "کد ملی",
  company_name: "نام شرکت",
  companyName: "نام شرکت",
  company_national_id: "شناسه ملی شرکت",
  companyNationalId: "شناسه ملی شرکت",
  representative_first_name: "نام نماینده",
  representative_last_name: "نام خانوادگی نماینده",
  representative_national_id: "کد ملی نماینده",
  registration_number: "شماره ثبت",
  economic_code: "کد اقتصادی",
  phone: "شماره موبایل",
  terms_accepted: "شرایط و قوانین",
  terms: "شرایط و قوانین",
  account_type: "نوع حساب",
  path: "مسیر",
  birth_certificate_number: "شماره شناسنامه",
  date_of_birth: "تاریخ تولد",
  code: "کد تأیید",
};

const hiddenErrorKeys = new Set(["non_field_errors", "detail", "code"]);

function presentError(key: string, value: string) {
  const label = fieldLabels[key];
  if (!label || value.includes(label)) return value;
  return `${label}: ${value}`;
}

function visibleErrorKeys(step: WizardStep, accountType: AccountType, enteringCode: boolean): readonly string[] {
  if (enteringCode) return [];
  if (step === 2) return accountType === "individual" ? individualErrorKeys : legalErrorKeys;
  if (step === 3) return contactErrorKeys;
  return [];
}

/** Messages for fields that are not on the screen the user is looking at. */
function offstepMessages(errors: Record<string, string>, visibleKeys: readonly string[], formError: string) {
  const visible = new Set<string>(visibleKeys);
  const messages: string[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (!value || visible.has(key) || hiddenErrorKeys.has(key)) continue;
    const text = presentError(key, value);
    if (text === formError || messages.includes(text)) continue;
    messages.push(text);
  }
  return messages;
}

function leadingFieldMessage(errors: Record<string, string>) {
  if (errors.code) return presentError("code", errors.code);
  for (const [key, value] of Object.entries(errors)) {
    if (!value || hiddenErrorKeys.has(key)) continue;
    return presentError(key, value);
  }
  return "";
}

function hasFieldMessage(fields: Record<string, string>) {
  return Object.entries(fields).some(([key, value]) => Boolean(value) && !hiddenErrorKeys.has(key));
}

const emptyDraft = (path: Path): Draft => ({
  accountType: "individual",
  path,
  phone: "",
  firstName: "",
  lastName: "",
  nationalId: "",
  companyName: "",
  companyNationalId: "",
  representativeFirstName: "",
  representativeLastName: "",
  representativeNationalId: "",
  registrationNumber: "",
  economicCode: "",
  terms: false,
});

export function RegisterForm({
  initialPath,
  embedded: _embedded = false,
  switchHref = "/login",
}: {
  initialPath: Path;
  embedded?: boolean;
  switchHref?: string;
}) {
  void _embedded;
  const router = useRouter();
  const { session, ready, signIn } = useAuth();
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(initialPath));
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [apiStep, setApiStep] = useState<ApiStep>("details");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [otpOwnsMessage, setOtpOwnsMessage] = useState(false);
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [sentPayload, setSentPayload] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const secondsLeft = resendAt > now ? Math.ceil((resendAt - now) / 1000) : 0;
  const stepTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };
  const phoneId = useId();

  useEffect(() => {
    if (ready && session && !showSuccess) router.replace(destinationFor(session.user, null));
  }, [ready, router, session, showSuccess]);

  useEffect(() => {
    if (resendAt === 0) return;
    const timer = window.setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (next >= resendAt) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    const apiKey = fieldErrorKeys[key];
    setErrors((current) => ({ ...current, [key]: "", ...(apiKey ? { [apiKey]: "" } : {}) }));
    setFormError("");
  }

  function validateIdentity(): Record<string, string> {
    const next: Record<string, string> = {};
    if (draft.accountType === "individual") {
      if (!draft.firstName.trim() || !draft.lastName.trim()) {
        next.first_name = "نام و نام خانوادگی را وارد کنید.";
      }
      if (!isNationalId(draft.nationalId)) next.national_id = "کد ملی معتبر نیست.";
    } else {
      if (!draft.companyName.trim() || !draft.representativeFirstName.trim() || !draft.representativeLastName.trim()) {
        next.company_name = "نام شرکت و نام نماینده را وارد کنید.";
      }
      if (!isCompanyNationalId(draft.companyNationalId)) {
        next.company_national_id = "شناسه ملی شرکت معتبر نیست.";
      }
      if (!isNationalId(draft.representativeNationalId)) {
        next.representative_national_id = "کد ملی نماینده معتبر نیست.";
      }
    }
    return next;
  }

  function applyApiFailure(error: ApiError) {
    setErrors(error.fields);
    const banner = error.fields.non_field_errors || (hasFieldMessage(error.fields) ? "" : error.message);
    setFormError(banner);
  }

  async function start(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (pending) return;
    setOtpOwnsMessage(false);
    const payload = buildPayload(draft);
    if ("errors" in payload) {
      setErrors(payload.errors);
      setFormError("");
      return;
    }
    if (secondsLeft > 0 && sentPayload && sentPayload !== JSON.stringify(payload.body)) {
      setFormError(`کد قبلی هنوز معتبر است. تا ${faNumber(secondsLeft)} ثانیه دیگر اطلاعات تازه جایگزین نمی‌شود.`);
      return;
    }
    setPending(true);
    setErrors({});
    setFormError("");
    try {
      await apiRequest("/auth/register/", { method: "POST", body: payload.body });
      setSentPayload(JSON.stringify(payload.body));
      setDraft((current) => ({ ...current, phone: payload.phone }));
      const started = Date.now();
      setNow(started);
      setResendAt(started + codeLifetimeSeconds * 1000);
      setApiStep("code");
    } catch (error) {
      if (error instanceof ApiError) applyApiFailure(error);
      else setFormError("ثبت‌نام انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function verify(code: string): Promise<Session> {
    setErrors({});
    setFormError("");
    setOtpOwnsMessage(false);
    try {
      const result = await apiRequest<{ access: string; refresh: string; user: unknown }>("/auth/register/verify/", {
        method: "POST",
        body: { phone: normalizeIranMobile(draft.phone), code },
      });
      return { access: result.access, refresh: result.refresh, user: userFromApi(result.user) };
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fields);
      else setFormError("ثبت‌نام انجام نشد.");
      setOtpOwnsMessage(true);
      throw error;
    }
  }

  function goNextFromPath() {
    setWizardStep(2);
  }

  function goNextFromIdentity(event: FormEvent) {
    event.preventDefault();
    const next = validateIdentity();
    const owned = new Set<string>(visibleErrorKeys(2, draft.accountType, false));
    setErrors((current) => {
      const kept = Object.fromEntries(Object.entries(current).filter(([key]) => !owned.has(key)));
      return { ...kept, ...next };
    });
    if (Object.keys(next).length > 0) return;
    setWizardStep(3);
  }

  const panelKey =
    apiStep === "code" ? "code" : showSuccess ? "success" : `wiz-${wizardStep}`;
  const enteringCode = apiStep === "code";
  const carried = offstepMessages(
    errors,
    visibleErrorKeys(wizardStep, draft.accountType, enteringCode),
    formError,
  );
  const echoedByOtp = enteringCode && otpOwnsMessage ? leadingFieldMessage(errors) : "";
  const carriedOnScreen = echoedByOtp ? carried.filter((message) => message !== echoedByOtp) : carried;
  const alerts = (
    <RegisterAlerts formError={echoedByOtp && formError === echoedByOtp ? "" : formError} messages={carriedOnScreen} />
  );

  return (
    <div className="auth-face relative overflow-hidden">
      <div className="auth-face__header">
        <span className="auth-face__logo" aria-hidden>
          <Icon name="bolt" className="size-7" />
        </span>
        <h1 className="auth-face__title">ثبت‌نام</h1>
        <p className="auth-face__subtitle">
          {wizardStep === 1
            ? "نوع حساب و مسیر خود را انتخاب کنید."
            : wizardStep === 2
              ? "اطلاعات هویتی را وارد کنید."
              : apiStep === "code"
                ? `کد شش‌رقمی برای ${formatIranMobile(draft.phone)} را وارد کنید.`
                : "شماره موبایل را تأیید کنید تا حساب ساخته شود."}
        </p>
      </div>

      {apiStep === "details" && !showSuccess ? (
        <div className="auth-face__progress" aria-hidden>
          {[1, 2, 3].map((seg) => (
            <span
              key={seg}
              className={cn(
                "auth-face__progress-seg",
                wizardStep > seg && "is-done",
                wizardStep === seg && "is-active",
              )}
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={panelKey}
          initial={reduceMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
          transition={stepTransition}
        >
          {showSuccess ? (
            <div className="auth-face__success">
              <span className="auth-face__success-mark" aria-hidden>
                <Icon name="check" className="size-7" />
              </span>
              <p className="auth-face__subtitle">حساب شما آماده است؛ در حال انتقال…</p>
            </div>
          ) : apiStep === "code" ? (
            <div className="grid gap-4">
              {alerts}
              <OtpInput
                key={resendAt}
                disabled={pending}
                onVerify={verify}
                onBusyChange={setPending}
                onVerified={(nextSession) => {
                  setShowSuccess(true);
                  signIn(nextSession);
                  window.setTimeout(() => {
                    router.replace(destinationFor(nextSession.user, null));
                  }, reduceMotion ? 200 : 900);
                }}
              />
              <div className="auth-face__meta-row">
                <button
                  type="button"
                  className="auth-face__link-violet"
                  disabled={pending || secondsLeft > 0}
                  onClick={() => void start()}
                >
                  {secondsLeft > 0
                    ? `ارسال دوباره تا ${faNumber(secondsLeft)} ثانیه`
                    : "ارسال دوباره کد"}
                </button>
                <button
                  type="button"
                  className="auth-face__back"
                  disabled={pending}
                  onClick={() => {
                    setOtpOwnsMessage(false);
                    setApiStep("details");
                  }}
                >
                  اصلاح اطلاعات
                </button>
              </div>
            </div>
          ) : wizardStep === 1 ? (
            <div className="grid gap-4">
              {alerts}
              <AccountType value={draft.accountType} onChange={(value) => update("accountType", value)} />
              <Intent value={draft.path} onChange={(value) => update("path", value)} />
              <button type="button" className="auth-face__cta" onClick={goNextFromPath}>
                ادامه
                <Icon name="arrow" className="size-4 rotate-180" />
              </button>
              <p className="auth-face__footer">
                حساب دارید؟{" "}
                <Link href={switchHref} scroll={false}>
                  ورود
                </Link>
              </p>
            </div>
          ) : wizardStep === 2 ? (
            <form onSubmit={goNextFromIdentity} noValidate className="grid gap-4">
              <button type="button" className="auth-face__back" onClick={() => setWizardStep(1)}>
                <Icon name="arrow" className="size-3.5" />
                بازگشت
              </button>
              {alerts}
              {draft.accountType === "individual" ? (
                <>
                  <FaceField
                    id="first_name"
                    label="نام"
                    icon="user"
                    error={errors.first_name ?? errors.firstName}
                  >
                    <input
                      id="first_name"
                      name="first_name"
                      autoComplete="given-name"
                      placeholder="نام"
                      value={draft.firstName}
                      onChange={(event) => update("firstName", event.target.value)}
                    />
                  </FaceField>
                  <FaceField
                    id="last_name"
                    label="نام خانوادگی"
                    icon="user"
                    error={errors.last_name ?? errors.lastName}
                  >
                    <input
                      id="last_name"
                      name="last_name"
                      autoComplete="family-name"
                      placeholder="نام خانوادگی"
                      value={draft.lastName}
                      onChange={(event) => update("lastName", event.target.value)}
                    />
                  </FaceField>
                  <FaceField
                    id="national_id"
                    label="کد ملی"
                    icon="card"
                    error={errors.national_id ?? errors.nationalId}
                  >
                    <input
                      id="national_id"
                      name="national_id"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={10}
                      placeholder="کد ملی"
                      className="text-end"
                      value={draft.nationalId}
                      onChange={(event) => update("nationalId", event.target.value)}
                    />
                  </FaceField>
                </>
              ) : (
                <>
                  <FaceField
                    id="company_name"
                    label="نام شرکت"
                    icon="home"
                    error={errors.company_name ?? errors.companyName}
                  >
                    <input
                      id="company_name"
                      name="company_name"
                      placeholder="نام شرکت"
                      value={draft.companyName}
                      onChange={(event) => update("companyName", event.target.value)}
                    />
                  </FaceField>
                  <FaceField
                    id="company_national_id"
                    label="شناسه ملی شرکت"
                    icon="card"
                    error={errors.company_national_id ?? errors.companyNationalId}
                  >
                    <input
                      id="company_national_id"
                      name="company_national_id"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={11}
                      placeholder="شناسه ملی شرکت"
                      className="text-end"
                      value={draft.companyNationalId}
                      onChange={(event) => update("companyNationalId", event.target.value)}
                    />
                  </FaceField>
                  <FaceField
                    id="representative_first_name"
                    label="نام نماینده"
                    icon="user"
                    error={errors.representative_first_name}
                  >
                    <input
                      id="representative_first_name"
                      name="representative_first_name"
                      autoComplete="given-name"
                      placeholder="نام نماینده"
                      value={draft.representativeFirstName}
                      onChange={(event) => update("representativeFirstName", event.target.value)}
                    />
                  </FaceField>
                  <FaceField
                    id="representative_last_name"
                    label="نام خانوادگی نماینده"
                    icon="user"
                    error={errors.representative_last_name}
                  >
                    <input
                      id="representative_last_name"
                      name="representative_last_name"
                      autoComplete="family-name"
                      placeholder="نام خانوادگی نماینده"
                      value={draft.representativeLastName}
                      onChange={(event) => update("representativeLastName", event.target.value)}
                    />
                  </FaceField>
                  <FaceField
                    id="representative_national_id"
                    label="کد ملی نماینده"
                    icon="card"
                    error={errors.representative_national_id}
                  >
                    <input
                      id="representative_national_id"
                      name="representative_national_id"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={10}
                      placeholder="کد ملی نماینده"
                      className="text-end"
                      value={draft.representativeNationalId}
                      onChange={(event) => update("representativeNationalId", event.target.value)}
                    />
                  </FaceField>
                  <FaceField
                    id="registration_number"
                    label="شماره ثبت"
                    icon="file"
                    error={errors.registration_number}
                  >
                    <input
                      id="registration_number"
                      name="registration_number"
                      dir="ltr"
                      maxLength={20}
                      placeholder="شماره ثبت (اختیاری)"
                      className="text-end"
                      value={draft.registrationNumber}
                      onChange={(event) => update("registrationNumber", event.target.value)}
                    />
                  </FaceField>
                  <FaceField id="economic_code" label="کد اقتصادی" icon="file" error={errors.economic_code}>
                    <input
                      id="economic_code"
                      name="economic_code"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={14}
                      placeholder="کد اقتصادی (اختیاری)"
                      className="text-end"
                      value={draft.economicCode}
                      onChange={(event) => update("economicCode", event.target.value)}
                    />
                  </FaceField>
                </>
              )}
              <button type="submit" className="auth-face__cta">
                ادامه
                <Icon name="arrow" className="size-4 rotate-180" />
              </button>
            </form>
          ) : (
            <form onSubmit={start} noValidate className="grid gap-4">
              <button type="button" className="auth-face__back" onClick={() => setWizardStep(2)}>
                <Icon name="arrow" className="size-3.5" />
                بازگشت
              </button>
              {alerts}
              <FaceField id={phoneId} label="شماره موبایل" icon="phone" error={errors.phone}>
                <input
                  id={phoneId}
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="text-end"
                  value={draft.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </FaceField>
              <label className="auth-face__terms">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={draft.terms}
                  onChange={(event) => update("terms", event.target.checked)}
                />
                <span className={cn("auth-face__check", draft.terms && "is-checked")} aria-hidden>
                  <Icon name="check" />
                </span>
                <span>
                  <Link href="/terms" className="auth-face__link-amber">
                    شرایط و قوانین
                  </Link>{" "}
                  را می‌پذیرم.
                </span>
              </label>
              {errors.terms_accepted ? <p className="auth-face__error">{errors.terms_accepted}</p> : null}
              <button type="submit" className="auth-face__cta" disabled={pending}>
                {pending ? <span className="auth-face__cta-spinner" aria-hidden /> : null}
                {pending ? "در حال ارسال کد…" : "دریافت کد تأیید"}
                {pending ? null : <Icon name="arrow" className="size-4 rotate-180" />}
              </button>
              <p className="auth-face__footer">
                حساب دارید؟{" "}
                <Link href={switchHref} scroll={false}>
                  ورود
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function RegisterAlerts({ formError, messages }: { formError: string; messages: string[] }) {
  const lines = formError ? [formError, ...messages] : messages;
  if (lines.length === 0) return null;
  return (
    <div role="alert" className="grid gap-1">
      {lines.map((message) => (
        <p key={message} className="auth-face__error">
          {message}
        </p>
      ))}
    </div>
  );
}

function FaceField({
  id,
  label,
  icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: IconName;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-face__field">
      <div className={cn("auth-face__control", error && "is-invalid auth-field-shake")}>
        <Icon name={icon} className="auth-face__control-icon size-4" />
        <div className="grid min-w-0 flex-1">
          <label htmlFor={id} className="sr-only">
            {label}
          </label>
          {children}
        </div>
      </div>
      {error ? (
        <p role="alert" className="auth-face__error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function AccountType({ value, onChange }: { value: AccountType; onChange: (value: AccountType) => void }) {
  const options: readonly (readonly [AccountType, string])[] = [
    ["individual", "حقیقی"],
    ["legal", "حقوقی"],
  ];
  return (
    <fieldset className="grid gap-2">
      <legend className="sr-only">نوع حساب</legend>
      <div className="auth-face__segment">
        <motion.span
          layoutId="auth-account-type-pill"
          className="auth-face__segment-thumb"
          style={{
            insetInlineStart: value === "individual" ? "0.25rem" : "calc(50% + 0.05rem)",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          aria-hidden
        />
        {options.map(([option, label]) => (
          <label key={option} className={cn(value === option && "is-active")}>
            <input
              type="radio"
              name="account_type"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Intent({ value, onChange }: { value: Path; onChange: (value: Path) => void }) {
  const options: readonly { value: Path; title: string; hint: string; icon: IconName }[] = [
    { value: "sell", title: "نیروگاه دارم", hint: "فروش برق نیروگاه موجود", icon: "bolt" },
    { value: "install", title: "نیروگاه ندارم", hint: "شروع مسیر نصب نیروگاه", icon: "plant" },
  ];
  return (
    <fieldset className="auth-face__path-grid">
      <legend className="sr-only">مسیر</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn("auth-face__path-card", value === option.value && "is-selected")}
        >
          <input
            type="radio"
            name="path"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="auth-face__path-icon" aria-hidden>
            <Icon name={option.icon} className="size-5" />
          </span>
          <span className="min-w-0 flex-1 text-start">
            <span className="auth-face__path-title">{option.title}</span>
            <span className="auth-face__path-hint">{option.hint}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function buildPayload(draft: Draft): { body: Record<string, unknown>; phone: string } | { errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const phone = normalizeIranMobile(draft.phone);
  if (!isIranMobile(phone)) errors.phone = "شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.";
  if (!draft.terms) errors.terms_accepted = "پذیرفتن شرایط برای ثبت‌نام لازم است.";

  if (draft.accountType === "individual") {
    if (!draft.firstName.trim() || !draft.lastName.trim()) errors.first_name = "نام و نام خانوادگی را وارد کنید.";
    if (!isNationalId(draft.nationalId)) errors.national_id = "کد ملی معتبر نیست.";
    if (Object.keys(errors).length > 0) return { errors };
    return {
      phone,
      body: {
        account_type: "individual",
        path: draft.path,
        phone,
        terms_accepted: true,
        first_name: draft.firstName.trim(),
        last_name: draft.lastName.trim(),
        national_id: digitsOnly(draft.nationalId),
      },
    };
  }

  if (!draft.companyName.trim() || !draft.representativeFirstName.trim() || !draft.representativeLastName.trim()) {
    errors.company_name = "نام شرکت و نام نماینده را وارد کنید.";
  }
  if (!isCompanyNationalId(draft.companyNationalId)) errors.company_national_id = "شناسه ملی شرکت معتبر نیست.";
  if (!isNationalId(draft.representativeNationalId)) errors.representative_national_id = "کد ملی نماینده معتبر نیست.";
  if (Object.keys(errors).length > 0) return { errors };
  return {
    phone,
    body: {
      account_type: "legal",
      path: draft.path,
      phone,
      terms_accepted: true,
      company_name: draft.companyName.trim(),
      company_national_id: digitsOnly(draft.companyNationalId),
      representative_first_name: draft.representativeFirstName.trim(),
      representative_last_name: draft.representativeLastName.trim(),
      representative_national_id: digitsOnly(draft.representativeNationalId),
      registration_number: draft.registrationNumber.trim(),
      economic_code: digitsOnly(draft.economicCode),
    },
  };
}
