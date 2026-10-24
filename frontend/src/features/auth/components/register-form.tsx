"use client";

import { useState, type FormEvent } from "react";
import { isIranMobile, normalizeIranMobile } from "@/features/auth/lib/phone";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/text-field";

type Path = "sell" | "install";

export function RegisterForm({ initialPath }: { initialPath: Path }) {
  const [path, setPath] = useState<Path>(initialPath);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = normalizeIranMobile(String(data.get("phone") ?? ""));
    if (name.length < 2) {
      setError("نام را کامل بنویسید.");
      setReady(false);
      return;
    }
    if (!isIranMobile(phone)) {
      setError("شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.");
      setReady(false);
      return;
    }
    setError("");
    setReady(true);
  }

  if (ready) {
    return (
      <div role="status" className="grid gap-3">
        <h1 className="text-3xl font-bold text-primary">اطلاعات فرم درست است</h1>
        <p className="leading-8 text-muted-foreground">
          ساخت حساب هنوز به سرویس ورود وصل نیست. مسیر انتخاب‌شده: {path === "sell" ? "فروش برق" : "نصب نیروگاه"}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">ثبت‌نام</h1>
        <p className="mt-2 leading-7 text-muted-foreground">حساب خانگی بسازید و مسیر فروش یا نصب را انتخاب کنید.</p>
      </div>
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-2 text-sm font-medium">مسیر</legend>
        {(
          [
            ["sell", "نیروگاه دارم"],
            ["install", "نیروگاه ندارم"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="cursor-pointer">
            <input
              type="radio"
              name="path"
              value={value}
              checked={path === value}
              onChange={() => setPath(value)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center rounded-control border border-border px-3 text-sm peer-checked:border-primary peer-checked:bg-mint peer-checked:font-semibold peer-checked:text-primary">
              {label}
            </span>
          </label>
        ))}
      </fieldset>
      <TextField name="name" label="نام و نام خانوادگی" autoComplete="name" />
      <TextField name="phone" label="شماره موبایل" inputMode="tel" autoComplete="tel" dir="ltr" error={error} />
      <Button type="submit">ادامه</Button>
    </form>
  );
}
