import { EquipmentEditClient } from "@/features/equipment/components/EquipmentEditClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش تجهیز" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardEquipmentEditPage({ params }: PageProps) {
  const { id } = await params;
  return <EquipmentEditClient id={id} />;
}
