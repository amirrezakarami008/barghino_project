import type { Metadata } from "next";
import { WalletWorkspace } from "@/features/wallets";

export const metadata: Metadata = { title: "کیف پول" };

export default function PaymentsPage() {
  return <WalletWorkspace />;
}
