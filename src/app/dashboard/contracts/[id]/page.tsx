import { ContractDetailView } from "@/features/contracts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "جزئیات قرارداد" };

interface ContractDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const { id } = await params;
  return <ContractDetailView contractId={id} />;
}
