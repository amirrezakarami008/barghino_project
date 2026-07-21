import { AuthLayout } from "@/components/pages/AuthLayout";
import { AuthForm } from "@/components/ui/Form";
import { AUTH_PAGES } from "@/lib/constants/pages";
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
