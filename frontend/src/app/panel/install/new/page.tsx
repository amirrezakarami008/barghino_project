import type { Metadata } from "next";
import { Suspense } from "react";
import { InstallCreate } from "@/features/installs/install-create";
import { LoadingCards } from "@/shared/ui/loading-cards";

export const metadata: Metadata = { title: "ثبت درخواست نصب" };

export default function NewInstallPage() {
  return (
    <Suspense fallback={<LoadingCards label="آماده‌سازی فرم درخواست نصب…" />}>
      <InstallCreate />
    </Suspense>
  );
}
