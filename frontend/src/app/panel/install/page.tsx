import type { Metadata } from "next";
import { Suspense } from "react";
import { InstallsList } from "@/features/installs/installs-list";
import { LoadingCards } from "@/shared/ui/loading-cards";

export const metadata: Metadata = { title: "درخواست نصب" };

export default function InstallPage() {
  return (
    <Suspense fallback={<LoadingCards label="آماده‌سازی درخواست‌های نصب…" />}>
      <InstallsList />
    </Suspense>
  );
}
