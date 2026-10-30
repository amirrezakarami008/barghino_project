import type { ReactNode } from "react";
import { SiteFooter } from "@/shared/layout/site-footer";
import { SiteHeader } from "@/shared/layout/site-header";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <SiteHeader />
      <main
        id="content"
        className="pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
