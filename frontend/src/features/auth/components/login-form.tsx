"use client";

import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { isIranMobile, normalizeIranMobile } from "@/features/auth/lib/phone";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";

type Errors = { phone?: string; password?: string };

export function LoginForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");
  const [recovery, setRecovery] = useState(false);
  const phoneId = useId();
  const passwordId = useId();
  const rememberId = useId();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    if (!isIranMobile(normalizeIranMobile(phone))) {
      next.phone = "شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.";
    }
    if (password.length < 8) {
      next.password = "رمز عبور باید حداقل ۸ نویسه باشد.";
    }
    setErrors(next);
    setRecovery(false);
    setNotice(Object.keys(next).length === 0 ? "بررسی شد" : "");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="text-center">
        <Logo href="/" caption={false} className="justify-center" />
        <p className="mt-3 text-xs text-muted-foreground">پلتفرم فروش برق خانگی و نیروگاه خورشیدی</p>
        <h1 className="mt-5 text-xl font-bold text-foreground">ورود به حساب کاربری</h1>
        <p className="mt-1 text-sm text-muted-foreground">خوشحالیم که دوباره همراه ما هستید.</p>
      </div>

      <Field id={phoneId} label="شماره موبایل" icon="user" error={errors.phone}>
        <input
          id={phoneId}
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          value={phone}
          aria-invalid={errors.phone ? true : undefined}
          className="w-full bg-transparent text-end text-base tracking-wider text-foreground outline-none placeholder:font-normal placeholder:tracking-wider placeholder:text-muted-foreground/70"
          onChange={(event) => {
            setPhone(event.target.value);
            setErrors((current) => ({ ...current, phone: undefined }));
            setNotice("");
          }}
        />
      </Field>

      <Field
        id={passwordId}
        label="رمز عبور"
        icon="lock"
        error={errors.password}
        end={
          <button
            type="button"
            className="grid size-9 cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-primary"
            aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} className="size-4" />
          </button>
        }
      >
        <input
          id={passwordId}
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          aria-invalid={errors.password ? true : undefined}
          className="w-full bg-transparent text-base text-foreground outline-none"
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
            setNotice("");
          }}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label htmlFor={rememberId} className="inline-flex cursor-pointer items-center gap-2">
          <input
            id={rememberId}
            name="remember"
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="size-4 accent-primary"
          />
          مرا به خاطر بسپار
        </label>
        <button
          type="button"
          className="cursor-pointer font-semibold text-primary"
          onClick={() => {
            setRecovery(true);
            setNotice("");
          }}
        >
          رمز عبور را فراموش کرده‌ام؟
        </button>
      </div>
      {recovery ? (
        <p role="status" className="text-sm leading-7 text-muted-foreground">
          بازیابی رمز هنوز به سرویس حساب وصل نیست.
        </p>
      ) : null}

      <Button type="submit" className="w-full">
        ورود
        <Icon name="arrow" className="size-4" />
      </Button>
      {notice ? (
        <p role="status" className="text-center text-sm leading-7 text-muted-foreground">
          شماره و رمز از نظر شکل درست‌اند. ورود هنوز به سرویس حساب وصل نیست
          {remember ? " و گزینه به‌خاطر سپردن فقط در همین صفحه مانده است." : "."}
        </p>
      ) : null}

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
        با ورود یا ثبت‌نام، شما با{" "}
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
  end,
  children,
}: {
  id: string;
  label: string;
  icon: "user" | "lock";
  error?: string;
  end?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div
        className={`rounded-2xl border bg-card px-3.5 py-2.5 transition-colors focus-within:border-primary ${error ? "border-danger" : "border-border"}`}
      >
        <div className="flex items-center gap-3">
          <Icon name={icon} className="size-4 shrink-0 text-muted-foreground" />
          <div className="grid min-w-0 flex-1">
            <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
              {label}
            </label>
            {children}
          </div>
          {end}
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
