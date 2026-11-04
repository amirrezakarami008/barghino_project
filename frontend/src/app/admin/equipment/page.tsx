import type { Metadata } from "next";
import { AdminEquipment } from "@/features/admin/admin-equipment";

export const metadata: Metadata = { title: "تجهیزات" };

export default function EquipmentPage() {
  return <AdminEquipment />;
}
