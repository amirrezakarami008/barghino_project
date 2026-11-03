"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { Alert } from "@/components/ui";
import { useAuth } from "@/features/auth/session-provider";

const labels: Record<string, string> = {
  account_type: "نوع حساب مشتری",
  first_name: "نام",
  last_name: "نام خانوادگی",
  national_id: "کد ملی",
  company_name: "نام شرکت",
  company_national_id: "شناسه ملی شرکت",
  representative_first_name: "نام نماینده",
  representative_last_name: "نام خانوادگی نماینده",
  representative_national_id: "کد ملی نماینده",
};

export function IdentityNotice(): ReactElement | null {
  const { profile } = useAuth();
  const completion = profile?.identityProfileCompletion;
  if (completion?.isComplete) return null;

  const missing =
    completion?.missingFields.length
      ? `موارد لازم: ${completion.missingFields.map((field) => labels[field] ?? "مشخصات هویتی").join("، ")}. `
      : "";

  return (
    <Alert
      tone="warning"
      title={completion ? "اطلاعات هویتی شما کامل نیست" : "کامل‌بودن اطلاعات هویتی مشخص نیست"}
    >
      <p>
        {missing}
        این اطلاعات برای امضا لازم‌اند؛ ساخت پیش‌نویس به معنی تأیید هویت نیست.
      </p>
      <Link
        href="/panel/profile"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
      >
        بررسی اطلاعات پروفایل
      </Link>
      <p className="mt-2 text-caption text-foreground-muted">
        پروفایل فعلی امکان مشاهده دارد؛ اگر فیلد لازم قابل ویرایش نیست، از پشتیبانی کمک بگیرید.
      </p>
    </Alert>
  );
}
