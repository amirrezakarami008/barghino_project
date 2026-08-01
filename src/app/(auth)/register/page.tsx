import { AuthShell, RegisterForm } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  description: "ثبت‌نام مشترک خانگی در برقینو — فروش برق یا درخواست نصب نیروگاه",
};

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <RegisterForm />
    </AuthShell>
  );
}
