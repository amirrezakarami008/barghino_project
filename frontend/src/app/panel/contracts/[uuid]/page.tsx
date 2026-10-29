import type { Metadata } from "next";
import { Suspense } from "react";
import { ContractDetail } from "@/features/contracts/contract-detail";
import { LoadingCards } from "@/shared/ui/loading-cards";
export const metadata: Metadata = { title: "جزئیات قرارداد" };
export default function ContractDetailPage() {
  return <Suspense fallback={<LoadingCards label="آماده‌سازی جزئیات قرارداد…" />}><ContractDetail /></Suspense>;
}
