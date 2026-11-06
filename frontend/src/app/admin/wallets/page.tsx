import type { Metadata } from "next";
import { AdminWallets } from "@/features/admin/admin-wallets";

export const metadata: Metadata = { title: "کیف پول‌ها" };

export default function AdminWalletsPage() {
  return <AdminWallets />;
}
