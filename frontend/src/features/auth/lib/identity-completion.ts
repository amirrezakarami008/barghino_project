import type { AuthUser } from "@/features/auth/lib/session";

/** Labels for `identity_profile_completion.missing_fields` and signing gates. */
export const identityFieldLabels: Record<string, string> = {
  account_type: "نوع حساب مشتری",
  first_name: "نام",
  last_name: "نام خانوادگی",
  national_id: "کد ملی",
  birth_certificate_number: "شماره شناسنامه",
  date_of_birth: "تاریخ تولد",
  representative_birth_certificate_number: "شماره شناسنامه نماینده",
  representative_date_of_birth: "تاریخ تولد نماینده",
  company_name: "نام شرکت",
  company_national_id: "شناسه ملی شرکت",
  representative_first_name: "نام نماینده",
  representative_last_name: "نام خانوادگی نماینده",
  representative_national_id: "کد ملی نماینده",
};

export function profileIdentityGaps(profile: AuthUser | null | undefined): string[] {
  if (!profile) return ["account_type"];
  return [...(profile.identityProfileCompletion?.missingFields ?? [])];
}

export function isProfileIdentityComplete(profile: AuthUser | null | undefined): boolean {
  if (!profile) return false;
  return profile.identityProfileCompletion?.isComplete === true;
}

/** Birth certificate is required at sign time (not in identity_profile_completion). */
export function hasBirthCertificateForSigning(profile: AuthUser | null | undefined): boolean {
  return Boolean(profile?.birthCertificateNumber?.trim());
}
