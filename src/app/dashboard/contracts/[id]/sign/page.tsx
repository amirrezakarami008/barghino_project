import { ContractSigningWizard } from "@/features/contracts/components/ContractSigningWizard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "امضای قرارداد" };

export default async function ContractSignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContractSigningWizard contractId={id} />;
}
