import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/features/auth/components/login-screen";

export const metadata: Metadata = { title: "ورود" };

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="px-6 py-10 text-sm text-muted-foreground">در حال آماده‌سازی ورود…</p>}>
      <LoginScreen />
    </Suspense>
  );
}
