import type { Metadata } from "next";
import { Suspense } from "react";
import { ContractsList } from "@/features/contracts/contracts-list";
import { LoadingCards } from "@/shared/ui/loading-cards";
export const metadata: Metadata = { title: "قراردادها" };
export default function ContractsPage() {
  return <Suspense fallback={<LoadingCards label="آماده‌سازی قراردادها…" />}><ContractsList /></Suspense>;
}
