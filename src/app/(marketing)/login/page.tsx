import { AuthLayout } from "@/features/marketing/components/AuthLayout";
import { AuthForm } from "@/shared/ui/Form";
import { AUTH_PAGES } from "@/features/marketing/constants/pages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به پنل کاربری برق ما",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthForm {...AUTH_PAGES.login} redirectTo="/dashboard" />
    </AuthLayout>
  );
}
