"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Lock,
  Smartphone,
  Sparkles,
  UserRound,
} from "@/shared/lib/icons";
import { cn } from "@/shared/lib/utils";
import { AUTH_COPY, AUTH_FIELDS } from "../constants";
import {
  isValidCompanyNationalId,
  isValidIranMobile,
  isValidNationalId,
  isValidPassword,
  onlyDigits,
} from "../lib/validation";
import type { AccountType, AuthFieldErrors } from "../types";
import { AccountTypeToggle } from "./AccountTypeToggle";
import { AuthInput } from "./AuthInput";

const STEPS = ["نوع حساب", "هویت", "امنیت"] as const;

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [companyNationalId, setCompanyNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<AuthFieldErrors>({});

  const validateStep = (currentStep: number) => {
    const nextErrors: AuthFieldErrors = {};

    if (currentStep === 1) {
      if (accountType === "individual") {
        if (!fullName.trim()) nextErrors.fullName = "نام و نام خانوادگی الزامی است.";
        if (!nationalId.trim()) nextErrors.nationalId = "کد ملی الزامی است.";
        else if (!isValidNationalId(nationalId)) nextErrors.nationalId = "کد ملی معتبر نیست.";
      } else {
        if (!companyName.trim()) nextErrors.companyName = "نام شرکت الزامی است.";
        if (!agentName.trim()) nextErrors.agentName = "نام نماینده الزامی است.";
        if (!companyNationalId.trim()) {
          nextErrors.companyNationalId = "شناسه ملی الزامی است.";
        } else if (!isValidCompanyNationalId(companyNationalId)) {
          nextErrors.companyNationalId = "شناسه ملی باید بین ۸ تا ۱۲ رقم باشد.";
        }
      }
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
    router.push("/dashboard");
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
                  done || active ? "bg-brand-400 shadow-[0_0_16px_rgba(34,211,238,0.55)]" : "bg-white/10",
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
            <AccountTypeToggle
              value={accountType}
              onChange={(next) => {
                setAccountType(next);
                setErrors({});
              }}
              variant="featured"
            />
          </div>
        )}

        {step === 1 && (
          <div className="auth-step space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {AUTH_COPY.register.identityTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {accountType === "individual"
                  ? AUTH_COPY.register.individualHint
                  : AUTH_COPY.register.legalHint}
              </p>
            </div>

            {accountType === "individual" ? (
              <>
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
              </>
            ) : (
              <>
                <AuthInput
                  label={AUTH_FIELDS.companyName.label}
                  name={AUTH_FIELDS.companyName.name}
                  type="text"
                  value={companyName}
                  required
                  error={errors.companyName}
                  icon={<Building2 className="h-4 w-4" />}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
                <AuthInput
                  label={AUTH_FIELDS.companyNationalId.label}
                  name={AUTH_FIELDS.companyNationalId.name}
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  maxLength={AUTH_FIELDS.companyNationalId.maxLength}
                  value={companyNationalId}
                  required
                  error={errors.companyNationalId}
                  icon={<Building2 className="h-4 w-4" />}
                  onChange={(event) =>
                    setCompanyNationalId(onlyDigits(event.target.value).slice(0, 12))
                  }
                />
                <AuthInput
                  label={AUTH_FIELDS.agentName.label}
                  name={AUTH_FIELDS.agentName.name}
                  type="text"
                  value={agentName}
                  required
                  error={errors.agentName}
                  icon={<UserRound className="h-4 w-4" />}
                  onChange={(event) => setAgentName(event.target.value)}
                />
              </>
            )}
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
              label={
                accountType === "legal"
                  ? `${AUTH_FIELDS.phone.label} نماینده`
                  : AUTH_FIELDS.phone.label
              }
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
