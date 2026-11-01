"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { OtpInput } from "@/features/auth/components/otp-input";
import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { formatIranMobile, isIranMobile, normalizeIranMobile } from "@/features/auth/lib/phone";
import { userFromApi, type Session } from "@/features/auth/lib/session";
import { destinationFor, useAuth } from "@/features/auth/session-provider";
import { faNumber } from "@/shared/lib/fa";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";
import "./auth-face.css";

const codeLifetimeSeconds = 120;

type Step = "phone" | "code";

type LoginFormProps = {
  /** Hide page chrome (logo) when rendered inside the flip card. */
  embedded?: boolean;
  /** Switch-face link target; preserves query when provided by AuthShell. */
  switchHref?: string;
};

export function LoginForm({ embedded = false, switchHref = "/register" }: LoginFormProps) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { session, ready, signIn } = useAuth();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const phoneId = useId();
  const secondsLeft = resendAt > now ? Math.ceil((resendAt - now) / 1000) : 0;
  const stepTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    if (ready && session) router.replace(destinationFor(session.user, next));
  }, [next, ready, router, session]);

  useEffect(() => {
    if (resendAt === 0) return;
    const timer = window.setInterval(() => {
      const nextTick = Date.now();
      setNow(nextTick);
      if (nextTick >= resendAt) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  async function requestCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (pending) return;
    const normalized = normalizeIranMobile(phone);
    if (!isIranMobile(normalized)) {
      setPhoneError("شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.");
      return;
    }
    setPending(true);
    setPhoneError("");
    setFormError("");
    try {
      await apiRequest("/auth/otp/request/", { method: "POST", body: { phone: normalized } });
      setPhone(normalized);
      const started = Date.now();
      setNow(started);
      setResendAt(started + codeLifetimeSeconds * 1000);
      setStep("code");
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "ارسال کد انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(code: string): Promise<Session> {
    setFormError("");
    const result = await apiRequest<{ access: string; refresh: string; user: unknown }>("/auth/otp/verify/", {
      method: "POST",
      body: { phone, code },
    });
    return { access: result.access, refresh: result.refresh, user: userFromApi(result.user) };
  }

  const header = (title: string, subtitle: string) => (
    <div className="auth-face__header">
      {embedded ? (
        <span className="auth-face__logo" aria-hidden>
          <Icon name="bolt" className="size-7" />
        </span>
      ) : (
        <Logo href="/" caption={false} className="justify-center" />
      )}
      <h1 className="auth-face__title">{title}</h1>
      <p className="auth-face__subtitle">{subtitle}</p>
    </div>
  );

  const codeStep = (
    <div className="auth-face grid gap-4">
      {header(
        "کد تأیید",
        `اگر شماره ${formatIranMobile(phone)} امکان دریافت پیامک داشته باشد، کد شش‌رقمی ارسال شده است.`,
      )}
      <OtpInput
        key={resendAt}
        disabled={pending}
        onVerify={verifyCode}
        onBusyChange={setPending}
        onVerified={(nextSession) => {
          signIn(nextSession);
          router.replace(destinationFor(nextSession.user, next));
        }}
      />
      {formError ? <p className="auth-face__error">{formError}</p> : null}
      <div className="auth-face__meta-row">
        <button
          type="button"
          className="auth-face__link-violet"
          disabled={pending || secondsLeft > 0}
          onClick={() => void requestCode()}
        >
          {secondsLeft > 0 ? `ارسال دوباره تا ${faNumber(secondsLeft)} ثانیه` : "ارسال دوباره کد"}
        </button>
        <button
          type="button"
          className="auth-face__back"
          disabled={pending}
          onClick={() => {
            setStep("phone");
            setFormError("");
          }}
        >
          اصلاح شماره
        </button>
      </div>
    </div>
  );

  const phoneStep = (
    <form onSubmit={requestCode} noValidate className="auth-face grid gap-4">
      {header("ورود به حساب کاربری", "شماره موبایل حساب را وارد کنید تا کد ورود برایتان پیامک شود.")}
      <Field id={phoneId} label="شماره موبایل" icon="phone" error={phoneError}>
        <input
          id={phoneId}
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          value={phone}
          aria-invalid={phoneError ? true : undefined}
          className="text-end"
          onChange={(event) => {
            setPhone(event.target.value);
            setPhoneError("");
            setFormError("");
          }}
        />
      </Field>
      {formError ? <p className="auth-face__error">{formError}</p> : null}
      <button type="submit" className="auth-face__cta" disabled={pending}>
        {pending ? <span className="auth-face__cta-spinner" aria-hidden /> : null}
        {pending ? "در حال ارسال…" : "دریافت کد تأیید"}
        {pending ? null : <Icon name="arrow" className="size-4 rotate-180" />}
      </button>
      <p className="auth-face__footer">
        حساب ندارید؟{" "}
        <Link href={switchHref} scroll={false}>
          ثبت‌نام
        </Link>
      </p>
    </form>
  );

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, x: step === "code" ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: step === "code" ? -16 : 16 }}
          transition={stepTransition}
        >
          {step === "code" ? codeStep : phoneStep}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Field({
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
      <div className={`auth-face__control${error ? " is-invalid auth-field-shake" : ""}`}>
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
