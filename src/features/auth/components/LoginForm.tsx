"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { Lock, Smartphone, Sparkles } from "@/shared/lib/icons";
import { cn } from "@/shared/lib/utils";
import { AUTH_COPY, AUTH_FIELDS } from "../constants";
import { onlyDigits, isValidIranMobile, isValidPassword } from "../lib/validation";
import type { AuthFieldErrors, LoginMethod } from "../types";
import { AuthInput } from "./AuthInput";
import { OtpInput } from "./OtpInput";

const OTP_RESEND_SECONDS = 120;

export function LoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("password");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<AuthFieldErrors>({});

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: AuthFieldErrors = {};

    if (!phone.trim()) nextErrors.identity = "شماره موبایل الزامی است.";
    else if (!isValidIranMobile(phone)) nextErrors.identity = "شماره موبایل معتبر نیست.";

    if (method === "password") {
      if (!password) nextErrors.password = "رمز عبور الزامی است.";
      else if (!isValidPassword(password)) {
        nextErrors.password = "رمز عبور باید بین ۸ تا ۲۴ کاراکتر باشد.";
      }
    } else if (otpSent && otp.length !== 6) {
      nextErrors.otp = "کد یکبارمصرف ۶ رقمی را وارد کنید.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 650));

    if (method === "otp" && !otpSent) {
      setOtpSent(true);
      setResendIn(OTP_RESEND_SECONDS);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand-400/20 bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium text-brand-200">
          <Sparkles className="h-3 w-3" />
          {AUTH_COPY.login.eyebrow}
        </div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {AUTH_COPY.login.title}
        </h2>
        <p className="mt-1.5 text-sm text-slate-400">{AUTH_COPY.login.subtitle}</p>
      </div>

      <p className="mb-4 text-xs text-slate-500">{AUTH_COPY.login.individualHint}</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthInput
          label={AUTH_FIELDS.phone.label}
          name={AUTH_FIELDS.phone.name}
          type="tel"
          inputMode="numeric"
          dir="ltr"
          autoComplete="tel"
          maxLength={AUTH_FIELDS.phone.maxLength}
          value={phone}
          required
          disabled={otpSent}
          error={errors.identity}
          icon={<Smartphone className="h-4 w-4" />}
          onChange={(event) => setPhone(onlyDigits(event.target.value).slice(0, 11))}
        />

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
          {(["password", "otp"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMethod(item);
                setOtpSent(false);
                setOtp("");
                setErrors({});
              }}
              className={cn(
                "rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-300",
                method === item
                  ? "bg-white text-slate-950 shadow-lg"
                  : "text-slate-400 hover:text-white",
              )}
            >
              {item === "password"
                ? AUTH_COPY.login.switchToPassword
                : AUTH_COPY.login.switchToOtp}
            </button>
          ))}
        </div>

        {method === "password" ? (
          <AuthInput
            label={AUTH_FIELDS.password.label}
            name={AUTH_FIELDS.password.name}
            type="password"
            autoComplete="current-password"
            minLength={AUTH_FIELDS.password.minLength}
            maxLength={AUTH_FIELDS.password.maxLength}
            value={password}
            required
            error={errors.password}
            icon={<Lock className="h-4 w-4" />}
            onChange={(event) => setPassword(event.target.value)}
          />
        ) : otpSent ? (
          <div className="space-y-3">
            <OtpInput value={otp} onChange={setOtp} error={errors.otp} />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>کد ارسال شد</span>
              <button
                type="button"
                disabled={resendIn > 0}
                onClick={() => setResendIn(OTP_RESEND_SECONDS)}
                className="font-medium text-brand-300 disabled:text-slate-600"
              >
                {resendIn > 0 ? `${resendIn}ث` : "ارسال مجدد"}
              </button>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-slate-400">
            کد یکبارمصرف پس از تأیید هویت به موبایل شما ارسال می‌شود.
          </p>
        )}

        {method === "password" && (
          <div className="flex justify-end">
            <button type="button" className="text-xs font-medium text-slate-400 hover:text-brand-300">
              {AUTH_COPY.login.forgotPassword}
            </button>
          </div>
        )}

        <Button type="submit" fullWidth size="lg" disabled={submitting} className="mt-1 !rounded-2xl">
          {submitting
            ? "در حال بررسی..."
            : method === "otp" && !otpSent
              ? AUTH_COPY.login.submitOtpRequest
              : method === "otp"
                ? AUTH_COPY.login.submitOtpVerify
                : AUTH_COPY.login.submitPassword}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {AUTH_COPY.login.noAccount}{" "}
        <Link href="/register" className="font-semibold text-brand-300 hover:text-brand-200">
          {AUTH_COPY.login.registerLink}
        </Link>
      </p>
    </div>
  );
}
