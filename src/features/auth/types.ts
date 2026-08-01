export type AccountType = "individual" | "legal";

export type UserPath = "sell" | "install";

export type LoginMethod = "password" | "otp";

export interface AuthFieldErrors {
  [key: string]: string | undefined;
}
