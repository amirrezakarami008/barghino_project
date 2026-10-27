"use client";

import { useAuth } from "@/features/auth/session-provider";
import { faDigits } from "@/shared/lib/fa";

export function ProfileDetails() {
  const { profile } = useAuth();
  if (!profile) return null;

  const identity = profile.identityProfile;
  const details: { label: string; value: string }[] = [
    { label: "نام", value: joinedName(profile.firstName, profile.lastName) || "ثبت نشده" },
    { label: "شماره موبایل", value: formatMobile(profile.phone) },
    { label: "نام کاربری", value: profile.username || "ثبت نشده" },
    { label: "ایمیل", value: profile.email || "ثبت نشده" },
    { label: "شناسهٔ حساب", value: profile.uuid || "ثبت نشده" },
    { label: "نوع حساب", value: profile.accountType === "individual" ? "حقیقی" : profile.accountType === "legal" ? "حقوقی" : "ثبت نشده" },
    { label: "شناسه ملی", value: profile.nationalId || "ثبت نشده" },
    { label: "نام شرکت", value: profile.companyName || "—" },
    { label: "شناسه ملی شرکت", value: profile.companyNationalId || "—" },
    { label: "مسیر انتخاب‌شده", value: profile.path === "sell" ? "فروش برق" : profile.path === "install" ? "نصب نیروگاه" : "ثبت نشده" },
    { label: "نقش حساب", value: profile.role === "admin" ? "مدیر" : "کاربر" },
    { label: "تأیید موبایل", value: profile.isPhoneVerified ? "تأیید شده" : "تأیید نشده" },
    { label: "زمان ایجاد حساب", value: formatDate(profile.dateJoined) },
  ];

  return (
    <section aria-labelledby="profile-details-title" className="product-profile grid gap-5">
      <h2 id="profile-details-title" className="text-lg font-semibold">اطلاعات حساب</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {details.map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd dir={item.label === "شماره موبایل" || item.label.includes("شناسه") ? "ltr" : undefined} className="mt-1 break-words text-sm font-medium">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      {identity ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">مشخصات هویتی</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {Object.entries(identity).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-surface px-3 py-2.5">
                <dt className="text-xs text-muted-foreground">{identityLabels[key] ?? key}</dt>
                <dd className="mt-1 text-sm font-medium">
                  {key === "kind" ? value === "individual" ? "حقیقی" : "حقوقی" : value || "ثبت نشده"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {profile.identityProfileCompletion ? (
        <p className="rounded-2xl bg-mint px-4 py-3 text-sm leading-7 text-primary">
          {profile.identityProfileCompletion.isComplete
            ? "اطلاعات هویتی کامل است."
            : `اطلاعات هویتی نیاز به تکمیل دارد: ${profile.identityProfileCompletion.missingFields.map((field) => identityLabels[field] ?? field).join("، ")}`}
        </p>
      ) : null}
    </section>
  );
}

const identityLabels: Record<string, string> = {
  kind: "نوع پروفایل",
  first_name: "نام",
  last_name: "نام خانوادگی",
  national_id: "کد ملی",
  company_name: "نام شرکت",
  company_national_id: "شناسه ملی شرکت",
  representative_first_name: "نام نماینده",
  representative_last_name: "نام خانوادگی نماینده",
  representative_national_id: "کد ملی نماینده",
  registration_number: "شماره ثبت",
  economic_code: "کد اقتصادی",
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
  return Number.isNaN(date.getTime()) ? "ثبت نشده" : new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(date);
}
