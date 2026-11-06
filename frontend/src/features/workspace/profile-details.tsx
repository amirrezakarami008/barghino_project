"use client";

import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { StatusPill, useToast } from "@/components/ui";
import { ApiError } from "@/features/auth/lib/api";
import { identityFieldLabels as identityLabels } from "@/features/auth/lib/identity-completion";
import { updateMyProfile } from "@/features/auth/lib/profile-api";
import { readSession, writeSession } from "@/features/auth/lib/session";
import { useAuth } from "@/features/auth/session-provider";
import { loadCompanyApproval, type CompanyApproval } from "@/features/workspace/company-approval";
import { faDigits, faNumber } from "@/shared/lib/fa";
import {
  gregorianIsoToJalali,
  jalaliMonthLength,
  jalaliToGregorianIso,
  jalaliYearOptions,
  JALALI_MONTHS,
  todayJalali,
  type JalaliParts,
} from "@/shared/lib/jalali";
import { Icon, type IconName } from "@/shared/ui/icon";
import "./profile-workspace.css";

type ProfileDraft = {
  firstName: string;
  lastName: string;
  email: string;
  birthCertificateNumber: string;
  dateOfBirth: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateOfBirthPattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOfBirth(value: string): boolean {
  if (!value.trim()) return true;
  if (!dateOfBirthPattern.test(value.trim())) return false;
  const date = new Date(`${value.trim()}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getTime() <= today.getTime();
}

export function ProfileDetails() {
  const { push: toast } = useToast();
  const { profile, hydrateProfile } = useAuth();
  const formId = useId();
  const [companyApproval, setCompanyApproval] = useState<CompanyApproval>("none");
  const [approvalNote, setApprovalNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!profile?.uuid) return;
    let cancelled = false;
    void loadCompanyApproval(profile.uuid)
      .then((result) => {
        if (cancelled) return;
        setCompanyApproval(result.state);
        setApprovalNote(result.note);
      })
      .catch(() => {
        if (cancelled) return;
        setCompanyApproval("none");
        setApprovalNote("وضعیت تأیید شرکت از سرویس خوانده نشد.");
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.uuid]);

  if (!profile) return null;

  const firstName = draft?.firstName ?? profile.firstName;
  const lastName = draft?.lastName ?? profile.lastName;
  const email = draft?.email ?? profile.email ?? "";
  const birthCertificateNumber =
    draft?.birthCertificateNumber ?? profile.birthCertificateNumber ?? "";
  const dateOfBirth = draft?.dateOfBirth ?? profile.dateOfBirth ?? "";
  const isLegal = profile.accountType === "legal";
  const birthCertificateLabel = isLegal ? "شماره شناسنامه نماینده" : "شماره شناسنامه";
  const dateOfBirthLabel = isLegal ? "تاریخ تولد نماینده" : "تاریخ تولد";
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "کاربر برقینو";
  const initials =
    [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("") ||
    profile.phone?.slice(-2) ||
    "ب";
  const identityComplete = profile.identityProfileCompletion?.isComplete === true;
  const missing = profile.identityProfileCompletion?.missingFields ?? [];
  const mobileVerified = profile.isPhoneVerified === true;
  const completeness = [mobileVerified, identityComplete, companyApproval === "approved"].filter(Boolean).length;
  const profileDirty =
    firstName.trim() !== profile.firstName ||
    lastName.trim() !== profile.lastName ||
    email.trim() !== (profile.email ?? "").trim() ||
    birthCertificateNumber.trim() !== (profile.birthCertificateNumber ?? "").trim() ||
    dateOfBirth.trim() !== (profile.dateOfBirth ?? "").trim();
  const emailValid = !email.trim() || emailPattern.test(email.trim());
  const dateOfBirthValid = isValidDateOfBirth(dateOfBirth);
  const canSave =
    editing &&
    profileDirty &&
    emailValid &&
    dateOfBirthValid &&
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    !saving;

  function startEditing() {
    setDraft({
      firstName: profile!.firstName,
      lastName: profile!.lastName,
      email: profile!.email ?? "",
      birthCertificateNumber: profile!.birthCertificateNumber ?? "",
      dateOfBirth: profile!.dateOfBirth ?? "",
    });
    setEditing(true);
    setSaveError("");
  }

  function cancelEditing() {
    setEditing(false);
    setDraft(null);
    setSaveError("");
  }

  function patchDraft(patch: Partial<ProfileDraft>) {
    setDraft({
      firstName: patch.firstName ?? firstName,
      lastName: patch.lastName ?? lastName,
      email: patch.email ?? email,
      birthCertificateNumber: patch.birthCertificateNumber ?? birthCertificateNumber,
      dateOfBirth: patch.dateOfBirth ?? dateOfBirth,
    });
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canSave) {
      if (!firstName.trim() || !lastName.trim()) {
        setSaveError("نام و نام خانوادگی الزامی است.");
      } else if (!dateOfBirthValid) {
        setSaveError("تاریخ تولد معتبر نیست (آینده پذیرفته نمی‌شود).");
      }
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const user = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        accountType: profile!.accountType,
        birthCertificateNumber: birthCertificateNumber.trim(),
        dateOfBirth: dateOfBirth.trim(),
      });
      hydrateProfile(user);
      const session = readSession();
      if (session) writeSession({ ...session, user });
      setDraft(null);
      setEditing(false);
      toast({ tone: "success", title: "مشخصات ذخیره شد." });
    } catch (error) {
      const fields =
        error instanceof ApiError
          ? error.fields.email ||
            error.fields.first_name ||
            error.fields.last_name ||
            error.fields.birth_certificate_number ||
            error.fields.date_of_birth ||
            error.fields.representative_birth_certificate_number ||
            error.fields.representative_date_of_birth
          : undefined;
      setSaveError(
        error instanceof ApiError
          ? (typeof fields === "string" ? fields : error.message) || "ذخیره پروفایل ممکن نشد."
          : "ذخیره پروفایل ممکن نشد. اتصال را بررسی کنید.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-workspace">
      <header className="profile-hero">
        <div className="profile-hero-row">
          <div className="profile-avatar" aria-hidden>
            {faDigits(initials)}
          </div>
          <div className="profile-hero-copy">
            <p className="profile-hero-eyebrow">حساب کاربری</p>
            <h2 className="profile-hero-name">{displayName}</h2>
            <div className="profile-hero-meta">
              <span dir="ltr">{formatMobile(profile.phone)}</span>
              <span aria-hidden>·</span>
              <span>
                {profile.accountType === "individual"
                  ? "حقیقی"
                  : profile.accountType === "legal"
                    ? "حقوقی"
                    : "نوع حساب ثبت نشده"}
              </span>
            </div>
          </div>
          <div className="profile-completeness" aria-label="پیشرفت هویت">
            <div className="profile-completeness-label">
              <span>مسیر هویت</span>
              <strong>
                {faNumber(completeness)}/{faNumber(3)}
              </strong>
            </div>
            <div className="profile-completeness-track" aria-hidden>
              <div
                className="profile-completeness-fill"
                style={{ width: `${(completeness / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="profile-panel" aria-labelledby={`${formId}-status`}>
        <div className="profile-panel-head">
          <div>
            <h3 id={`${formId}-status`} className="profile-panel-title">
              وضعیت مسیر هویت
            </h3>
            <p className="profile-panel-sub">موبایل، مشخصات هویتی و تأیید شرکت سه وضعیت جدا هستند.</p>
          </div>
        </div>
        <div className="profile-status-list">
          <StatusRow
            icon="phone"
            tone={mobileVerified ? "ok" : "warn"}
            title="تأیید موبایل"
            detail={mobileVerified ? "شماره با OTP تأیید شده است." : "موبایل هنوز تأیید نشده است."}
            pill={
              <StatusPill status={mobileVerified ? "approved" : "pending"} label={mobileVerified ? "انجام شده" : "ناقص"} />
            }
          />
          <StatusRow
            icon="shield"
            tone={identityComplete ? "ok" : "warn"}
            title="اطلاعات هویتی"
            detail={
              identityComplete
                ? "فیلدهای هویتی لازم کامل است."
                : missing.length
                  ? `ناقص: ${missing.map((field) => identityLabels[field] ?? field).join("، ")}`
                  : "وضعیت تکمیل هویت مشخص نیست."
            }
            pill={
              <StatusPill
                status={identityComplete ? "approved" : "pending"}
                label={identityComplete ? "کامل" : "ناقص"}
              />
            }
          />
          <CompanyStatusRow state={companyApproval} detail={approvalNote} />
        </div>
      </section>

      <section className="profile-panel" aria-labelledby={`${formId}-edit`}>
        <div className="profile-panel-head">
          <div>
            <h3 id={`${formId}-edit`} className="profile-panel-title">
              مشخصات قابل ویرایش
            </h3>
            <p className="profile-panel-sub">
              نام، شناسنامه، تاریخ تولد و ایمیل را از همین‌جا به‌روز کنید.
            </p>
          </div>
          {!editing ? (
            <button type="button" className="profile-action-btn profile-action-btn--ghost" onClick={startEditing}>
              <Icon name="edit" className="size-3.5" />
              ویرایش
            </button>
          ) : null}
        </div>

        <form id={formId} onSubmit={(event) => void saveProfile(event)}>
          <div className="profile-fields">
            <FieldRow
              label="نام"
              editing={editing}
              value={firstName}
              display={firstName.trim() || "ثبت نشده"}
              empty={!firstName.trim()}
              required
              disabled={saving}
              onChange={(value) => patchDraft({ firstName: value })}
            />
            <FieldRow
              label="نام خانوادگی"
              editing={editing}
              value={lastName}
              display={lastName.trim() || "ثبت نشده"}
              empty={!lastName.trim()}
              required
              disabled={saving}
              onChange={(value) => patchDraft({ lastName: value })}
            />
            <FieldRow
              label={birthCertificateLabel}
              editing={editing}
              value={birthCertificateNumber}
              display={birthCertificateNumber.trim() ? faDigits(birthCertificateNumber.trim()) : "ثبت نشده"}
              empty={!birthCertificateNumber.trim()}
              disabled={saving}
              dir="ltr"
              inputMode="numeric"
              maxLength={32}
              placeholder="۱۲۳۴۵"
              hint={editing ? "اختیاری در پروفایل؛ قبل از امضای قرارداد لازم است." : undefined}
              onChange={(value) => patchDraft({ birthCertificateNumber: value })}
            />
            <JalaliDateField
              label={dateOfBirthLabel}
              editing={editing}
              value={dateOfBirth}
              display={formatDateOfBirth(dateOfBirth)}
              empty={!dateOfBirth.trim()}
              disabled={saving}
              error={
                dateOfBirth.trim() && !dateOfBirthValid
                  ? "تاریخ شمسی معتبر وارد کنید؛ تاریخ آینده پذیرفته نمی‌شود."
                  : undefined
              }
              hint={editing ? "اختیاری؛ انتخاب با تقویم شمسی." : undefined}
              onChange={(value) => patchDraft({ dateOfBirth: value })}
            />
            <FieldRow
              label="ایمیل"
              editing={editing}
              value={email}
              display={email.trim() || "ثبت نشده"}
              empty={!email.trim()}
              disabled={saving}
              type="email"
              dir="ltr"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              placeholder="name@example.com"
              error={email.trim() && !emailValid ? "ایمیل معتبر وارد کنید." : undefined}
              hint={editing ? "اختیاری؛ برای اطلاع‌رسانی حساب." : undefined}
              onChange={(value) => patchDraft({ email: value })}
            />
          </div>

          {editing ? (
            <div className="profile-actions">
              <p
                className={
                  saveError
                    ? "profile-actions-status profile-actions-status--err"
                    : profileDirty
                      ? "profile-actions-status"
                      : "profile-actions-status"
                }
                role={saveError ? "alert" : undefined}
              >
                {saveError
                  ? saveError
                  : profileDirty
                    ? "تغییرات ذخیره نشده‌اند."
                    : "هنوز تغییری اعمال نشده است."}
              </p>
              <div className="profile-actions-btns">
                <button
                  type="button"
                  className="profile-action-btn profile-action-btn--ghost"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  انصراف
                </button>
                <button type="submit" className="profile-action-btn profile-action-btn--primary" disabled={!canSave}>
                  {saving ? "در حال ذخیره…" : "ذخیره"}
                </button>
              </div>
            </div>
          ) : null}
        </form>
      </section>

      <section className="profile-panel" aria-labelledby={`${formId}-meta`}>
        <div className="profile-panel-head">
          <div>
            <h3 id={`${formId}-meta`} className="profile-panel-title">
              اطلاعات ثابت حساب
            </h3>
            <p className="profile-panel-sub">این موارد از مسیر ثبت‌نام ثبت شده‌اند و اینجا قابل تغییر نیستند.</p>
          </div>
        </div>
        <dl className="profile-meta-grid">
          {[
            { label: "شماره موبایل", value: formatMobile(profile.phone), dir: "ltr" as const },
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
            <div key={item.label} className="profile-meta-item">
              <dt>{item.label}</dt>
              <dd dir={item.dir}>{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="profile-lock-note">
          <Icon name="lock" className="size-3.5" />
          <span>برای اصلاح شماره ملی، نوع حساب یا مسیر ثبت‌نام با پشتیبانی تماس بگیرید.</span>
        </p>
      </section>
    </div>
  );
}

function FieldRow({
  label,
  editing,
  value,
  display,
  empty,
  onChange,
  required,
  disabled,
  type = "text",
  dir,
  autoComplete,
  inputMode,
  maxLength,
  placeholder,
  error,
  hint,
}: {
  label: string;
  editing: boolean;
  value: string;
  display: string;
  empty?: boolean;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  dir?: "ltr" | "rtl";
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  placeholder?: string;
  error?: string;
  hint?: string;
}) {
  const id = useId();

  if (!editing) {
    return (
      <div className="profile-field-row">
        <span className="profile-field-label">{label}</span>
        <span className={empty ? "profile-field-value profile-field-value--empty" : "profile-field-value"} dir={dir}>
          {display}
        </span>
      </div>
    );
  }

  return (
    <div className="profile-field-row profile-field-row--editing">
      <label className="profile-field-label" htmlFor={id}>
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      <div>
        <input
          id={id}
          className="profile-field-control"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
          dir={dir}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
        />
        {error ? <p className="profile-field-error">{error}</p> : null}
        {!error && hint ? <p className="profile-field-hint">{hint}</p> : null}
      </div>
    </div>
  );
}

function JalaliDateField({
  label,
  editing,
  value,
  display,
  empty,
  onChange,
  disabled,
  error,
  hint,
}: {
  label: string;
  editing: boolean;
  value: string;
  display: string;
  empty?: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
}) {
  const baseId = useId();
  const parsed = value.trim() ? gregorianIsoToJalali(value.trim()) : null;
  const today = todayJalali();
  const year = parsed?.year ?? "";
  const month = parsed?.month ?? "";
  const day = parsed?.day ?? "";
  const yearOptions = jalaliYearOptions(1300, today.year);
  const dayCount =
    typeof year === "number" && typeof month === "number"
      ? jalaliMonthLength(year, month)
      : 31;

  function emit(next: Partial<JalaliParts> & { clear?: boolean }): void {
    if (next.clear) {
      onChange("");
      return;
    }
    const nextYear = next.year ?? (typeof year === "number" ? year : null);
    const nextMonth = next.month ?? (typeof month === "number" ? month : null);
    const nextDay = next.day ?? (typeof day === "number" ? day : null);
    if (nextYear === null || nextMonth === null || nextDay === null) {
      onChange("");
      return;
    }
    const maxDay = jalaliMonthLength(nextYear, nextMonth);
    const safeDay = Math.min(nextDay, maxDay);
    const iso = jalaliToGregorianIso({ year: nextYear, month: nextMonth, day: safeDay });
    onChange(iso ?? "");
  }

  if (!editing) {
    return (
      <div className="profile-field-row">
        <span className="profile-field-label">{label}</span>
        <span className={empty ? "profile-field-value profile-field-value--empty" : "profile-field-value"}>
          {display}
        </span>
      </div>
    );
  }

  return (
    <div className="profile-field-row profile-field-row--editing">
      <span className="profile-field-label" id={`${baseId}-label`}>
        {label}
      </span>
      <div>
        <div className="profile-jalali-date" role="group" aria-labelledby={`${baseId}-label`}>
          <label className="sr-only" htmlFor={`${baseId}-year`}>
            سال شمسی
          </label>
          <select
            id={`${baseId}-year`}
            className="profile-field-control profile-jalali-date__control"
            value={year === "" ? "" : String(year)}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            onChange={(event) => {
              const next = event.target.value;
              if (!next) {
                emit({ clear: true });
                return;
              }
              emit({
                year: Number(next),
                month: typeof month === "number" ? month : 1,
                day: typeof day === "number" ? day : 1,
              });
            }}
          >
            <option value="">سال</option>
            {yearOptions.map((item) => (
              <option key={item} value={item}>
                {faDigits(item)}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${baseId}-month`}>
            ماه شمسی
          </label>
          <select
            id={`${baseId}-month`}
            className="profile-field-control profile-jalali-date__control"
            value={month === "" ? "" : String(month)}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            onChange={(event) => {
              const next = event.target.value;
              if (!next) {
                emit({ clear: true });
                return;
              }
              emit({
                year: typeof year === "number" ? year : today.year,
                month: Number(next),
                day: typeof day === "number" ? day : 1,
              });
            }}
          >
            <option value="">ماه</option>
            {JALALI_MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${baseId}-day`}>
            روز شمسی
          </label>
          <select
            id={`${baseId}-day`}
            className="profile-field-control profile-jalali-date__control"
            value={day === "" ? "" : String(day)}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            onChange={(event) => {
              const next = event.target.value;
              if (!next) {
                emit({ clear: true });
                return;
              }
              emit({
                year: typeof year === "number" ? year : today.year,
                month: typeof month === "number" ? month : 1,
                day: Number(next),
              });
            }}
          >
            <option value="">روز</option>
            {Array.from({ length: dayCount }, (_, index) => index + 1).map((item) => (
              <option key={item} value={item}>
                {faDigits(item)}
              </option>
            ))}
          </select>
          {value.trim() ? (
            <button
              type="button"
              className="profile-jalali-date__clear"
              disabled={disabled}
              onClick={() => emit({ clear: true })}
            >
              پاک کردن
            </button>
          ) : null}
        </div>
        {error ? <p className="profile-field-error">{error}</p> : null}
        {!error && hint ? <p className="profile-field-hint">{hint}</p> : null}
      </div>
    </div>
  );
}

function StatusRow({
  icon,
  tone,
  title,
  detail,
  pill,
}: {
  icon: IconName;
  tone: "ok" | "warn" | "bad";
  title: string;
  detail: string;
  pill: ReactNode;
}) {
  return (
    <div className="profile-status-row">
      <span className={`profile-status-icon profile-status-icon--${tone}`} aria-hidden>
        <Icon name={icon} className="size-3.5" />
      </span>
      <div className="profile-status-copy">
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      {pill}
    </div>
  );
}

function CompanyStatusRow({ state, detail }: { state: CompanyApproval; detail: string }) {
  const tone = state === "approved" ? "ok" : state === "rejected" ? "bad" : "warn";
  const pillStatus =
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
    <StatusRow
      icon="plant"
      tone={tone}
      title="تأیید شرکت"
      detail={`${detail} بر اساس وضعیت انشعاب/نیروگاه — نه ادغام‌شده با هویت.`}
      pill={<StatusPill status={pillStatus} label={label} />}
    />
  );
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

function formatDateOfBirth(value?: string | null) {
  if (!value?.trim()) return "ثبت نشده";
  if (!dateOfBirthPattern.test(value.trim())) return value.trim();
  const date = new Date(`${value.trim()}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value.trim()
    : new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(date);
}
