"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { ArrowLeft, ArrowRight, Lock, Smartphone, Sparkles, Sun, UserRound, Zap } from "@/shared/lib/icons";
import { cn } from "@/shared/lib/utils";
import { AUTH_COPY, AUTH_FIELDS, USER_PATHS } from "../constants";
import {
  isValidIranMobile,
  isValidNationalId,
  isValidPassword,
  onlyDigits,
} from "../lib/validation";
import type { AuthFieldErrors, UserPath } from "../types";
import { AuthInput } from "./AuthInput";

const STEPS = ["مسیر", "هویت", "امنیت"] as const;

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userPath, setUserPath] = useState<UserPath>("sell");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<AuthFieldErrors>({});

  const validateStep = (currentStep: number) => {
    const nextErrors: AuthFieldErrors = {};

    if (currentStep === 1) {
      if (!fullName.trim()) nextErrors.fullName = "نام و نام خانوادگی الزامی است.";
      if (!nationalId.trim()) nextErrors.nationalId = "کد ملی الزامی است.";
      else if (!isValidNationalId(nationalId)) nextErrors.nationalId = "کد ملی معتبر نیست.";
    }

    if (currentStep === 2) {
      if (!phone.trim()) nextErrors.phone = "شماره موبایل الزامی است.";
      else if (!isValidIranMobile(phone)) nextErrors.phone = "شماره موبایل معتبر نیست.";

      if (!password) nextErrors.password = "رمز عبور الزامی است.";
      else if (!isValidPassword(password)) {
        nextErrors.password = "رمز عبور باید بین ۸ تا ۲۴ کاراکتر باشد.";
      }

      if (!confirmPassword) nextErrors.confirmPassword = "تکرار رمز عبور الزامی است.";
      else if (password !== confirmPassword) {
        nextErrors.confirmPassword = "رمز عبور و تکرار آن یکسان نیست.";
      }

      if (!acceptedTerms) nextErrors.terms = "پذیرش شرایط و مقررات الزامی است.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (!validateStep(step)) return;
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((value) => Math.max(value - 1, 0));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    if (!validateStep(2)) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const dest = USER_PATHS.find((p) => p.value === userPath)?.href ?? "/dashboard";
    router.push(dest);
  };

  return (
    <div>
      <div className="mb-5">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand-400/20 bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium text-brand-200">
          <Sparkles className="h-3 w-3" />
          {AUTH_COPY.register.eyebrow}
        </div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {AUTH_COPY.register.title}
        </h2>
        <p className="mt-1.5 text-sm text-slate-400">{AUTH_COPY.register.subtitle}</p>
      </div>

      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={label} className="flex flex-1 flex-col gap-2">
              <div
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  done || active ? "bg-brand-400" : "bg-white/10",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-brand-200" : done ? "text-slate-300" : "text-slate-600",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {step === 0 && (
          <div className="auth-step space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {AUTH_COPY.register.chooseTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{AUTH_COPY.register.chooseHint}</p>
            </div>
            <div className="grid gap-3">
              {USER_PATHS.map((path) => {
                const selected = userPath === path.value;
                const Icon = path.value === "sell" ? Zap : Sun;
                return (
                  <button
                    key={path.value}
                    type="button"
                    onClick={() => setUserPath(path.value)}
                    className={cn(
                      "rounded-2xl border p-4 text-right transition-all",
                      selected
                        ? "border-brand-400/50 bg-brand-500/15 ring-1 ring-brand-400/30"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          selected ? "bg-brand-500/20 text-brand-300" : "bg-white/5 text-slate-400",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-500">{path.label}</p>
                        <p className="font-display text-base font-bold text-white">{path.title}</p>
                        <p className="mt-1 text-xs leading-6 text-slate-400">{path.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="auth-step space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {AUTH_COPY.register.identityTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{AUTH_COPY.register.individualHint}</p>
            </div>
            <AuthInput
              label={AUTH_FIELDS.fullName.label}
              name={AUTH_FIELDS.fullName.name}
              type="text"
              autoComplete="name"
              value={fullName}
              required
              error={errors.fullName}
              icon={<UserRound className="h-4 w-4" />}
              onChange={(event) => setFullName(event.target.value)}
            />
            <AuthInput
              label={AUTH_FIELDS.nationalId.label}
              name={AUTH_FIELDS.nationalId.name}
              type="text"
              inputMode="numeric"
              dir="ltr"
              maxLength={AUTH_FIELDS.nationalId.maxLength}
              value={nationalId}
              required
              error={errors.nationalId}
              icon={<UserRound className="h-4 w-4" />}
              onChange={(event) => setNationalId(onlyDigits(event.target.value).slice(0, 10))}
            />
          </div>
        )}

        {step === 2 && (
          <div className="auth-step space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {AUTH_COPY.register.securityTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500">شماره تماس و رمز عبور حساب را تنظیم کنید.</p>
            </div>

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
              error={errors.phone}
              icon={<Smartphone className="h-4 w-4" />}
              onChange={(event) => setPhone(onlyDigits(event.target.value).slice(0, 11))}
            />
            <AuthInput
              label={AUTH_FIELDS.password.label}
              name={AUTH_FIELDS.password.name}
              type="password"
              autoComplete="new-password"
              minLength={AUTH_FIELDS.password.minLength}
              maxLength={AUTH_FIELDS.password.maxLength}
              value={password}
              required
              error={errors.password}
              icon={<Lock className="h-4 w-4" />}
              onChange={(event) => setPassword(event.target.value)}
            />
            <AuthInput
              label={AUTH_FIELDS.confirmPassword.label}
              name={AUTH_FIELDS.confirmPassword.name}
              type="password"
              autoComplete="new-password"
              minLength={AUTH_FIELDS.password.minLength}
              maxLength={AUTH_FIELDS.password.maxLength}
              value={confirmPassword}
              required
              error={errors.confirmPassword}
              icon={<Lock className="h-4 w-4" />}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-brand-500 focus:ring-brand-400"
              />
              <span>
                {AUTH_COPY.register.termsPrefix}{" "}
                <Link href="/terms" className="font-semibold text-brand-300 hover:text-brand-200">
                  {AUTH_COPY.register.termsLink}
                </Link>
              </span>
            </label>
            {errors.terms && <p className="-mt-2 text-xs text-red-300">{errors.terms}</p>}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={goBack}
              className="!rounded-2xl !text-slate-300 hover:!bg-white/5 hover:!text-white"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="start"
            >
              {AUTH_COPY.register.back}
            </Button>
          )}
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={submitting}
            className="!rounded-2xl"
            icon={step < STEPS.length - 1 ? <ArrowLeft className="h-4 w-4" /> : undefined}
          >
            {submitting
              ? "در حال ثبت..."
              : step < STEPS.length - 1
                ? AUTH_COPY.register.next
                : AUTH_COPY.register.submit}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {AUTH_COPY.register.hasAccount}{" "}
        <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
          {AUTH_COPY.register.loginLink}
        </Link>
      </p>
    </div>
  );
}
