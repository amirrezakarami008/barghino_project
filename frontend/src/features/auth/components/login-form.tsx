"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { OtpInput } from "@/features/auth/components/otp-input";
import { ApiError, apiRequest } from "@/features/auth/lib/api";
import { formatIranMobile, isIranMobile, normalizeIranMobile } from "@/features/auth/lib/phone";
import { userFromApi, type Session } from "@/features/auth/lib/session";
import { destinationFor, useAuth } from "@/features/auth/session-provider";
import { faNumber } from "@/shared/lib/fa";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";

const codeLifetimeSeconds = 120;

type Step = "phone" | "code";

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { session, ready, signIn } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const phoneId = useId();
  const secondsLeft = resendAt > now ? Math.ceil((resendAt - now) / 1000) : 0;

  useEffect(() => {
    if (ready && session) router.replace(destinationFor(session.user, next));
  }, [next, ready, router, session]);

  useEffect(() => {
    if (resendAt === 0) return;
    const timer = window.setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (next >= resendAt) window.clearInterval(timer);
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

  if (step === "code") {
    return (
      <div className="grid gap-4">
        <div className="text-center">
          <Logo href="/" caption={false} className="justify-center" />
          <h1 className="mt-6 text-xl font-bold text-foreground">کد تأیید</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            اگر شماره {formatIranMobile(phone)} امکان دریافت پیامک داشته باشد، کد شش‌رقمی ارسال شده است.
          </p>
        </div>
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
        {formError ? <p className="text-sm leading-7 text-danger">{formError}</p> : null}
        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="cursor-pointer font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending || secondsLeft > 0}
            onClick={() => void requestCode()}
          >
            {secondsLeft > 0 ? `ارسال دوباره تا ${faNumber(secondsLeft)} ثانیه` : "ارسال دوباره کد"}
          </button>
          <button
            type="button"
            className="cursor-pointer text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
  }

  return (
    <form onSubmit={requestCode} noValidate className="grid gap-4">
      <div className="text-center">
        <Logo href="/" caption={false} className="justify-center" />
        <p className="mt-3 text-xs text-muted-foreground">پلتفرم فروش برق خانگی و نیروگاه خورشیدی</p>
        <h1 className="mt-5 text-xl font-bold text-foreground">ورود به حساب کاربری</h1>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">شماره موبایل حساب را وارد کنید تا کد ورود برایتان پیامک شود.</p>
      </div>
      <Field id={phoneId} label="شماره موبایل" icon="user" error={phoneError} hideLabel>
        <input
          id={phoneId}
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder="شماره موبایل"
          value={phone}
          aria-invalid={phoneError ? true : undefined}
          className="w-full bg-transparent py-1 text-end text-base outline-none focus-visible:outline-none placeholder:text-foreground-muted/70"
          onChange={(event) => {
            setPhone(event.target.value);
            setPhoneError("");
            setFormError("");
          }}
        />
      </Field>
      {formError ? <p className="text-sm leading-7 text-danger">{formError}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "در حال ارسال…" : "دریافت کد"}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        یا
        <span className="h-px flex-1 bg-border" />
      </div>
      <ButtonLink href="/register" variant="secondary" className="w-full">
        <Icon name="user" className="size-4" />
        ثبت‌نام در برقینو
      </ButtonLink>
      <p className="text-center text-xs leading-6 text-muted-foreground">
        با ورود، شما با{" "}
        <Link href="/terms" className="font-semibold text-primary">
          شرایط
        </Link>{" "}
        و{" "}
        <Link href="/privacy" className="font-semibold text-primary">
          قوانین
        </Link>{" "}
        موافقت می‌کنید.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  icon,
  error,
  hideLabel = false,
  children,
}: {
  id: string;
  label: string;
  icon: IconName;
  error?: string;
  hideLabel?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div
        className={`rounded-xl border bg-card px-3.5 py-2.5 shadow-soft transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 ${error ? "border-danger" : "border-border"}`}
      >
        <div className="flex items-center gap-3">
          <Icon name={icon} className="size-4 shrink-0 text-muted-foreground" />
          <div className="grid min-w-0 flex-1">
            <label htmlFor={id} className={hideLabel ? "sr-only" : "text-xs font-medium text-muted-foreground"}>
              {label}
            </label>
            {children}
          </div>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-sm leading-6 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
