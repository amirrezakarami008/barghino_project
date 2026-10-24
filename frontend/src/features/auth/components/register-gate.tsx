"use client";

import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/register-form";

export function RegisterGate() {
  const path = useSearchParams().get("path") === "install" ? "install" : "sell";
  return <RegisterForm initialPath={path} />;
}
