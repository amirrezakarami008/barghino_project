const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export const env = {
  apiUrl: configured || "http://localhost:8000",
} as const;
