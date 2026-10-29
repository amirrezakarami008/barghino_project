import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { ContractCreate } from "@/features/contracts/contract-create";
export const metadata: Metadata = { title: "قرارداد جدید" };
export default function NewContractPage() { return <Suspense fallback={<LoadingCards label="آماده‌سازی مسیر قرارداد…" />}><ContractCreate /></Suspense>; }
