"use client";

import { useEffect, useState } from "react";
import { Alert, Badge, Card, StatusPill } from "@/components/ui";
import { useAuth } from "@/features/auth/session-provider";
import { getPlants, getBranches } from "@/features/plants/plants-api";
import { faDigits, faNumber } from "@/shared/lib/fa";

type CompanyApproval = "none" | "pending" | "approved" | "rejected";

export function ProfileDetails() {
  const { profile } = useAuth();
  const [companyApproval, setCompanyApproval] = useState<CompanyApproval>("none");
  const [approvalNote, setApprovalNote] = useState("");

  useEffect(() => {
    if (!profile) return;
    const controller = new AbortController();
    void Promise.all([getPlants(1, controller.signal), getBranches(1, controller.signal)])
      .then(([plants, branches]) => {
        const assets = [...plants.results, ...branches.results];
        if (!assets.length) {
          setCompanyApproval("none");
          setApprovalNote("هنوز انشعاب یا نیروگاهی برای بررسی شرکت ثبت نشده است.");
          return;
        }
        if (assets.some((item) => item.status === "active")) {
          setCompanyApproval("approved");
          setApprovalNote("دست‌کم یک انشعاب یا نیروگاه تأییدشده دارید.");
          return;
        }
        if (assets.some((item) => item.status === "inactive")) {
          setCompanyApproval("rejected");
          const note = assets.find((item) => item.status === "inactive" && item.review_note)?.review_note;
          setApprovalNote(note || "دست‌کم یک مورد رد شده است؛ جزئیات در نیروگاه من.");
          return;
        }
        setCompanyApproval("pending");
        setApprovalNote("انشعاب یا نیروگاه ثبت شده و در انتظار بررسی شرکت است.");
      })
      .catch(() => {
        setCompanyApproval("none");
        setApprovalNote("وضعیت تأیید شرکت از سرویس خوانده نشد.");
      });
    return () => controller.abort();
  }, [profile]);

  if (!profile) return null;

  const identityComplete = profile.identityProfileCompletion?.isComplete === true;
  const missing = profile.identityProfileCompletion?.missingFields ?? [];
  const mobileVerified = profile.isPhoneVerified === true;

  const completeness = [mobileVerified, identityComplete, companyApproval === "approved"].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h2 className="text-h2">پروفایل</h2>
        <p className="mt-2 text-body text-foreground-muted">
          فعلاً فقط خواندنی است. سه نشانگر زیر جدا از هم‌اند و با هم ادغام نمی‌شوند.
        </p>
      </header>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-caption text-foreground-muted">کامل بودن مسیر هویت</p>
            <p className="mt-1 text-h3 tabular-nums">
              {faNumber(completeness)} از {faNumber(3)}
            </p>
          </div>
          <Badge tone="soft">فقط مشاهده</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Indicator
            title="تأیید موبایل"
            ok={mobileVerified}
            detail={mobileVerified ? "شماره با OTP تأیید شده است." : "موبایل هنوز تأیید نشده است."}
          />
          <Indicator
            title="اطلاعات هویتی"
            ok={identityComplete}
            detail={
              identityComplete
                ? "فیلدهای هویتی لازم کامل است."
                : missing.length
                  ? `ناقص: ${missing.map((field) => identityLabels[field] ?? field).join("، ")}`
                  : "وضعیت تکمیل هویت مشخص نیست."
            }
          />
          <CompanyIndicator state={companyApproval} detail={approvalNote} />
        </div>
      </Card>

      <Alert tone="info" title="این سه مورد یکی نیستند">
        تأیید موبایل، کامل بودن فیلدهای هویتی، و نتیجهٔ بررسی شرکت روی انشعاب/نیروگاه سه وضعیت جدا هستند.
      </Alert>

      <section aria-labelledby="profile-details-title" className="space-y-4">
        <h3 id="profile-details-title" className="text-h4">
          اطلاعات حساب
        </h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "نام", value: joinedName(profile.firstName, profile.lastName) || "ثبت نشده" },
            { label: "شماره موبایل", value: formatMobile(profile.phone), dir: "ltr" as const },
            { label: "ایمیل", value: profile.email || "ثبت نشده" },
            {
              label: "نوع حساب",
              value:
                profile.accountType === "individual"
                  ? "حقیقی"
                  : profile.accountType === "legal"
                    ? "حقوقی"
                    : "ثبت نشده",
            },
            {
              label: "مسیر انتخاب‌شده",
              value:
                profile.path === "sell"
                  ? "فروش برق"
                  : profile.path === "install"
                    ? "نصب نیروگاه"
                    : "ثبت نشده",
            },
            { label: "زمان ایجاد حساب", value: formatDate(profile.dateJoined) },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card px-4 py-3 shadow-soft">
              <dt className="text-caption text-foreground-muted">{item.label}</dt>
              <dd dir={item.dir} className="mt-1 break-words text-sm font-medium">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function Indicator({ title, ok, detail }: { title: string; ok: boolean; detail: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        <StatusPill status={ok ? "approved" : "pending"} label={ok ? "انجام شده" : "ناقص"} />
      </div>
      <p className="mt-2 text-caption leading-6 text-foreground-muted">{detail}</p>
    </div>
  );
}

function CompanyIndicator({ state, detail }: { state: CompanyApproval; detail: string }) {
  const tone =
    state === "approved" ? "approved" : state === "rejected" ? "rejected" : state === "pending" ? "pending" : "draft";
  const label =
    state === "approved"
      ? "تأیید شده"
      : state === "rejected"
        ? "رد شده"
        : state === "pending"
          ? "در انتظار"
          : "ثبت نشده";
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">تأیید شرکت</p>
        <StatusPill status={tone} label={label} />
      </div>
      <p className="mt-2 text-caption leading-6 text-foreground-muted">{detail}</p>
      <p className="mt-2 text-caption text-foreground-muted">بر اساس وضعیت انشعاب/نیروگاه — نه ادغام‌شده با هویت.</p>
    </div>
  );
}

const identityLabels: Record<string, string> = {
  first_name: "نام",
  last_name: "نام خانوادگی",
  national_id: "کد ملی",
  company_name: "نام شرکت",
  company_national_id: "شناسه ملی شرکت",
  representative_first_name: "نام نماینده",
  representative_last_name: "نام خانوادگی نماینده",
  representative_national_id: "کد ملی نماینده",
};

function joinedName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ");
}

function formatMobile(phone: string) {
  const normalized = phone.replace(/\D/g, "");
  if (normalized.length === 11) {
    return faDigits(`${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`);
  }
  return faDigits(phone);
}

function formatDate(value?: string | null) {
  if (!value) return "ثبت نشده";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "ثبت نشده"
    : new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(date);
}
