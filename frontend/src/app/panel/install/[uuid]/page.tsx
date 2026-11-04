import type { Metadata } from "next";
import { Suspense } from "react";
import { InstallDetail } from "@/features/installs/install-detail";
import { LoadingCards } from "@/shared/ui/loading-cards";

export const metadata: Metadata = { title: "جزئیات درخواست نصب" };

export default function InstallDetailPage() {
  return (
    <Suspense fallback={<LoadingCards label="آماده‌سازی جزئیات درخواست…" />}>
      <InstallDetail />
    </Suspense>
  );
}
