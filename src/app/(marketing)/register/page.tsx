import { AuthLayout } from "@/features/marketing/components/AuthLayout";
import { AuthForm } from "@/shared/ui/Form";
import { AUTH_PAGES } from "@/features/marketing/constants/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  description: "ثبت‌نام در سامانه برق ما — تامین برق در ۳ دقیقه",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthForm {...AUTH_PAGES.register} redirectTo="/dashboard" />
    </AuthLayout>
  );
}
