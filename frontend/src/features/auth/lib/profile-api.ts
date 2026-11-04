import { apiRequest } from "@/features/auth/lib/api";
import { userFromApi, type AuthUser } from "@/features/auth/lib/session";

/** GET /api/v1/auth/me/ — current authenticated user. */
export async function getMe(signal?: AbortSignal): Promise<AuthUser> {
  const raw = await apiRequest<unknown>("/auth/me/", { auth: true, signal });
  return userFromApi(raw);
}

export type UpdateMyProfileInput = {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly accountType: string;
  readonly birthCertificateNumber: string;
  readonly dateOfBirth: string;
};

/**
 * PUT /api/v1/auth/me/
 * Editable: first_name, last_name, email, and account-type birth fields.
 * Individual: birth_certificate_number, date_of_birth
 * Legal: representative_birth_certificate_number, representative_date_of_birth
 */
export async function updateMyProfile(input: UpdateMyProfileInput): Promise<AuthUser> {
  const body: Record<string, string | null> = {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
  };
  if (input.accountType === "legal") {
    body.representative_birth_certificate_number = input.birthCertificateNumber;
    body.representative_date_of_birth = input.dateOfBirth || null;
  } else {
    body.birth_certificate_number = input.birthCertificateNumber;
    body.date_of_birth = input.dateOfBirth || null;
  }

  const raw = await apiRequest<unknown>("/auth/me/", {
    method: "PUT",
    auth: true,
    body,
  });
  return userFromApi(raw);
}

/** @deprecated Prefer updateMyProfile */
export async function updateMyNames(firstName: string, lastName: string, email = ""): Promise<AuthUser> {
  return updateMyProfile({
    firstName,
    lastName,
    email,
    accountType: "individual",
    birthCertificateNumber: "",
    dateOfBirth: "",
  });
}
