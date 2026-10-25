import type { ReactNode } from "react";
import { AuthStage } from "@/features/auth/components/auth-stage";
import { Logo } from "@/shared/ui/logo";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <AuthStage wide>
      <Logo href="/" caption={false} className="mb-6 justify-center" />
      {children}
    </AuthStage>
  );
}
