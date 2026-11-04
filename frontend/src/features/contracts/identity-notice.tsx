"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { Alert } from "@/components/ui";
import {
  hasBirthCertificateForSigning,
  identityFieldLabels,
  isProfileIdentityComplete,
  profileIdentityGaps,
} from "@/features/auth/lib/identity-completion";
import { useAuth } from "@/features/auth/session-provider";

export function IdentityNotice(): ReactElement | null {
  const { profile } = useAuth();
  const identityComplete = isProfileIdentityComplete(profile);
  const hasBirthCertificate = hasBirthCertificateForSigning(profile);
  if (identityComplete && hasBirthCertificate) return null;

  const missingFields = profileIdentityGaps(profile);
  const parts: string[] = [];
  if (missingFields.length) {
    parts.push(
      `موارد لازم: ${missingFields.map((field) => identityFieldLabels[field] ?? "مشخصات هویتی").join("، ")}.`,
    );
  }
  if (identityComplete && !hasBirthCertificate) {
    parts.push(
      profile?.accountType === "legal"
        ? "برای امضا، شماره شناسنامه نماینده را در پروفایل وارد کنید."
        : "برای امضا، شماره شناسنامه را در پروفایل وارد کنید.",
    );
  }

  return (
    <Alert
      tone="warning"
      title={
        !identityComplete
          ? profile?.identityProfileCompletion
            ? "اطلاعات هویتی شما کامل نیست"
            : "کامل‌بودن اطلاعات هویتی مشخص نیست"
          : "شماره شناسنامه برای امضا لازم است"
      }
    >
      <p>
        {parts.join(" ")}{" "}
        این اطلاعات برای امضا لازم‌اند؛ ساخت پیش‌نویس به معنی تأیید هویت نیست.
      </p>
      <Link
        href="/panel/profile"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
      >
        بررسی اطلاعات پروفایل
      </Link>
      <p className="mt-2 text-caption text-foreground-muted">
        نام، شماره شناسنامه و تاریخ تولد را از پروفایل می‌توانید ویرایش کنید؛ شماره ملی و نوع حساب فقط از پشتیبانی
        قابل اصلاح‌اند.
      </p>
    </Alert>
  );
}
