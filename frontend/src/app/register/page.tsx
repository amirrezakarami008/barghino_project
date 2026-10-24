import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFrame } from "@/features/auth/components/auth-frame";
import { RegisterGate } from "@/features/auth/components/register-gate";

export const metadata: Metadata = { title: "ثبت‌نام" };

export default function RegisterPage() {
  return (
    <AuthFrame>
      <Suspense fallback={<p className="text-sm text-muted-foreground">در حال آماده‌سازی فرم…</p>}>
        <RegisterGate />
      </Suspense>
    </AuthFrame>
  );
}
