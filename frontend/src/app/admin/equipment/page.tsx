import type { Metadata } from "next";
import { AdminLockedSection } from "@/features/admin/admin-locked-section";

export const metadata: Metadata = { title: "تجهیزات" };

export default function EquipmentPage() {
  return <AdminLockedSection title="کاتالوگ تجهیزات" />;
}
