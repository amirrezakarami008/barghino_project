"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ComponentProps, type FormEvent } from "react";
import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { isCompanyNationalId, isNationalId } from "@/features/auth/lib/identity";
import { digitsOnly, formatIranMobile, isIranMobile, normalizeIranMobile } from "@/features/auth/lib/phone";
import { userFromApi, type Session } from "@/features/auth/lib/session";
import { destinationFor, useAuth } from "@/features/auth/session-provider";
import { faDigits } from "@/shared/lib/fa";
import { cx } from "@/shared/lib/cx";
import { Button } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { TextField as BaseTextField } from "@/shared/ui/text-field";

const codeLifetimeSeconds = 120;

type AccountType = "individual" | "legal";
type Path = "sell" | "install";
type Step = "details" | "code";

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

export function RegisterForm({ initialPath }: { initialPath: Path }) {
  const router = useRouter();
  const { session, ready, signIn } = useAuth();
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(initialPath));
  const [step, setStep] = useState<Step>("details");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [sentPayload, setSentPayload] = useState<string>("");
  const secondsLeft = resendAt > now ? Math.ceil((resendAt - now) / 1000) : 0;

  useEffect(() => {
    if (ready && session) router.replace(destinationFor(session.user, null));
  }, [ready, router, session]);

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

  async function start(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const payload = buildPayload(draft);
    if ("errors" in payload) {
      setErrors(payload.errors);
      setFormError("");
      return;
    }
    if (secondsLeft > 0 && sentPayload && sentPayload !== JSON.stringify(payload.body)) {
      setFormError(`کد قبلی هنوز معتبر است. تا ${faDigits(secondsLeft)} ثانیه دیگر اطلاعات تازه جایگزین نمی‌شود.`);
      return;
    }
    setPending(true);
    setErrors({});
    setFormError("");
    try {
      await apiRequest("/auth/register/", { method: "POST", body: payload.body });
      setSentPayload(JSON.stringify(payload.body));
      setDraft((current) => ({ ...current, phone: payload.phone }));
      setCode("");
      const started = Date.now();
      setNow(started);
      setResendAt(started + codeLifetimeSeconds * 1000);
      setStep("code");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields);
        setFormError(error.fields.phone || error.fields.terms_accepted ? "" : error.message);
      } else {
        setFormError("ثبت‌نام انجام نشد.");
      }
    } finally {
      setPending(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = digitsOnly(code);
    if (normalizedCode.length !== 6) {
      setErrors({ code: "کد شش‌رقمی پیامک را وارد کنید." });
      return;
    }
    setPending(true);
    setErrors({});
    setFormError("");
    try {
      const result = await apiRequest<{ access: string; refresh: string; user: unknown }>("/auth/register/verify/", {
        method: "POST",
        body: { phone: normalizeIranMobile(draft.phone), code: normalizedCode },
      });
      const nextSession: Session = {
        access: result.access,
        refresh: result.refresh,
        user: userFromApi(result.user),
      };
      signIn(nextSession);
      router.replace(destinationFor(nextSession.user, null));
    } catch (error) {
      if (error instanceof ApiError) setErrors({ code: error.fields.code ?? error.message });
      else setFormError("تأیید ثبت‌نام انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={verify} noValidate className="grid gap-5">
        <div>
          <h1 className="text-3xl font-bold text-primary">کد تأیید</h1>
          <p className="mt-2 leading-7 text-muted-foreground">
            کد شش‌رقمی برای {formatIranMobile(draft.phone)} را وارد کنید. حساب پس از تأیید این کد ساخته می‌شود.
          </p>
        </div>
        <TextField
          name="code"
          label="کد تأیید"
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          maxLength={6}
          value={code}
          error={errors.code}
          className="text-center text-2xl tracking-[0.4em]"
          onChange={(event) => {
            setCode(digitsOnly(event.target.value).slice(0, 6));
            setErrors({});
          }}
        />
        {formError ? <p className="text-sm leading-7 text-danger">{formError}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "در حال ساخت حساب…" : "تأیید و ساخت حساب"}
        </Button>
        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="cursor-pointer font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending || secondsLeft > 0}
            onClick={() => void start()}
          >
            {secondsLeft > 0 ? `ارسال دوباره تا ${faDigits(secondsLeft)} ثانیه` : "ارسال دوباره کد"}
          </button>
          <button type="button" className="cursor-pointer text-muted-foreground" onClick={() => setStep("details")}>
            اصلاح اطلاعات
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={start} noValidate className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-primary">ثبت‌نام</h1>
        <p className="mt-2 leading-7 text-muted-foreground">حساب حقیقی یا حقوقی بسازید. کد تأیید پیامک می‌شود و حساب بعد از آن ساخته می‌شود.</p>
      </div>
      <AccountType value={draft.accountType} onChange={(value) => update("accountType", value)} />
      <Intent value={draft.path} onChange={(value) => update("path", value)} />
      <TextField
        name="phone"
        label="شماره موبایل"
        inputMode="tel"
        autoComplete="tel"
        dir="ltr"
        value={draft.phone}
        error={errors.phone}
        onChange={(event) => update("phone", event.target.value)}
      />
      {draft.accountType === "individual" ? (
        <>
          <TextField name="first_name" label="نام" autoComplete="given-name" value={draft.firstName} error={errors.first_name ?? errors.firstName} onChange={(event) => update("firstName", event.target.value)} />
          <TextField name="last_name" label="نام خانوادگی" autoComplete="family-name" value={draft.lastName} error={errors.last_name ?? errors.lastName} onChange={(event) => update("lastName", event.target.value)} />
          <TextField name="national_id" label="کد ملی" inputMode="numeric" dir="ltr" maxLength={10} value={draft.nationalId} error={errors.national_id ?? errors.nationalId} onChange={(event) => update("nationalId", event.target.value)} />
        </>
      ) : (
        <>
          <TextField name="company_name" label="نام شرکت" value={draft.companyName} error={errors.company_name ?? errors.companyName} onChange={(event) => update("companyName", event.target.value)} />
          <TextField name="company_national_id" label="شناسه ملی شرکت" inputMode="numeric" dir="ltr" maxLength={11} value={draft.companyNationalId} error={errors.company_national_id ?? errors.companyNationalId} onChange={(event) => update("companyNationalId", event.target.value)} />
          <TextField name="representative_first_name" label="نام نماینده" autoComplete="given-name" value={draft.representativeFirstName} error={errors.representative_first_name} onChange={(event) => update("representativeFirstName", event.target.value)} />
          <TextField name="representative_last_name" label="نام خانوادگی نماینده" autoComplete="family-name" value={draft.representativeLastName} error={errors.representative_last_name} onChange={(event) => update("representativeLastName", event.target.value)} />
          <TextField name="representative_national_id" label="کد ملی نماینده" inputMode="numeric" dir="ltr" maxLength={10} value={draft.representativeNationalId} error={errors.representative_national_id} onChange={(event) => update("representativeNationalId", event.target.value)} />
          <TextField name="registration_number" label="شماره ثبت" hint="اختیاری" dir="ltr" maxLength={20} value={draft.registrationNumber} error={errors.registration_number} onChange={(event) => update("registrationNumber", event.target.value)} />
          <TextField name="economic_code" label="کد اقتصادی" hint="اختیاری" inputMode="numeric" dir="ltr" maxLength={14} value={draft.economicCode} error={errors.economic_code} onChange={(event) => update("economicCode", event.target.value)} />
        </>
      )}
      <label className="flex items-start gap-2 text-sm leading-7">
        <input
          type="checkbox"
          name="terms_accepted"
          checked={draft.terms}
          onChange={(event) => update("terms", event.target.checked)}
          className="mt-1.5 size-4 accent-primary"
        />
        <span>
          <Link href="/terms" className="font-semibold text-primary">
            شرایط و قوانین
          </Link>{" "}
          را می‌پذیرم.
        </span>
      </label>
      {errors.terms_accepted ? <p className="text-sm leading-6 text-danger">{errors.terms_accepted}</p> : null}
      {formError ? <p className="text-sm leading-7 text-danger">{formError}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "در حال ارسال کد…" : "دریافت کد تأیید"}
      </Button>
      <p className="text-sm text-muted-foreground">
        حساب دارید؟{" "}
        <Link href="/login" className="font-semibold text-primary">
          ورود
        </Link>
      </p>
    </form>
  );
}

function TextField({ dir, className, ...props }: ComponentProps<typeof BaseTextField>) {
  return (
    <BaseTextField
      labelMode="placeholder"
      dir={dir}
      className={cx(dir === "ltr" && !String(className ?? "").includes("text-center") && "text-end", className)}
      {...props}
    />
  );
}

function AccountType({ value, onChange }: { value: AccountType; onChange: (value: AccountType) => void }) {
  const options: readonly (readonly [AccountType, string])[] = [
    ["individual", "حقیقی"],
    ["legal", "حقوقی"],
  ];
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-muted-foreground">نوع حساب</legend>
      <div className="grid grid-cols-2 rounded-full bg-white/55 p-1 ring-1 ring-white/80">
        {options.map(([option, label]) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name="account_type"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center rounded-full text-sm transition-colors peer-checked:bg-primary peer-checked:font-semibold peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Intent({ value, onChange }: { value: Path; onChange: (value: Path) => void }) {
  const options: readonly { value: Path; title: string; hint: string; icon: IconName }[] = [
    { value: "sell", title: "فروش برق", hint: "نیروگاه دارم و می‌خواهم بفروشم", icon: "bolt" },
    { value: "install", title: "نصب نیروگاه", hint: "هنوز نیروگاه ندارم", icon: "plant" },
  ];
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium text-muted-foreground">قصد شما</legend>
      <div className="grid gap-2">
        {options.map((option) => (
          <label key={option.value} className="group cursor-pointer">
            <input
              type="radio"
              name="path"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/40 px-3 py-2.5 transition-colors group-has-[:checked]:border-primary/30 group-has-[:checked]:bg-white group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-primary">
              <span className="size-4 shrink-0 rounded-full border-2 border-border bg-white group-has-[:checked]:border-primary group-has-[:checked]:bg-primary group-has-[:checked]:shadow-[inset_0_0_0_3px_white]" />
              <span className="min-w-0 flex-1 text-start">
                <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                <span className="block text-xs leading-5 text-muted-foreground">{option.hint}</span>
              </span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint text-primary">
                <Icon name={option.icon} className="size-4" />
              </span>
            </span>
          </label>
        ))}
      </div>
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
