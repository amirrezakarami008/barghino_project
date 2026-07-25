import { ContractsManager } from "@/features/contracts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "قراردادها" };

export default function ContractsPage() {
  return <ContractsManager />;
}
