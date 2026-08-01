import { AuthShell, LoginForm } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود",
  description: "ورود به پنل کاربری برقینو — حقیقی و حقوقی",
};

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <LoginForm />
    </AuthShell>
  );
}
