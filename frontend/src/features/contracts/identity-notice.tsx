"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { useAuth } from "@/features/auth/session-provider";
import { Icon } from "@/shared/ui/icon";
const labels: Record<string, string> = { account_type: "نوع حساب مشتری", first_name: "نام", last_name: "نام خانوادگی", national_id: "کد ملی", company_name: "نام شرکت", company_national_id: "شناسه ملی شرکت", representative_first_name: "نام نماینده", representative_last_name: "نام خانوادگی نماینده", representative_national_id: "کد ملی نماینده" };
export function IdentityNotice(): ReactElement | null {
  const { profile } = useAuth();
  const completion = profile?.identityProfileCompletion;
  if (completion?.isComplete) return null;
  return <aside className="contract-feedback contract-feedback-warning"><Icon name="user" className="size-5 shrink-0" /><div><strong>{completion ? "اطلاعات هویتی شما کامل نیست" : "کامل‌بودن اطلاعات هویتی مشخص نیست"}</strong><p>{completion?.missingFields.length ? `موارد لازم: ${completion.missingFields.map((field) => labels[field] ?? "مشخصات هویتی").join("، ")}. ` : ""}این اطلاعات برای امضا لازم‌اند؛ ساخت پیش‌نویس به معنی تأیید هویت نیست.</p><Link href="/panel/profile">بررسی اطلاعات پروفایل</Link><p className="contract-note">پروفایل فعلی امکان مشاهده دارد؛ اگر فیلد لازم قابل ویرایش نیست، از پشتیبانی کمک بگیرید.</p></div></aside>;
}
