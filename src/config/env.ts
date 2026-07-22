/**
 * Type-safe environment access.
 * Add validated env vars here as backend integration grows.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
  /** Public site URL — set NEXT_PUBLIC_SITE_URL in deployment */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** API base — set when backend is ready */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
} as const;
