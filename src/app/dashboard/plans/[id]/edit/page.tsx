import { PlanEditClient } from "@/features/plans";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش پلن" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPlanEditPage({ params }: PageProps) {
  const { id } = await params;
  return <PlanEditClient id={id} />;
}
