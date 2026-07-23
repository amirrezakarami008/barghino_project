import { AuthShell, RegisterForm } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  description: "ثبت‌نام حقیقی یا حقوقی در سامانه برق ما",
};

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <RegisterForm />
    </AuthShell>
  );
}
