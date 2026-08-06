import { ProductionPageContent } from "@/features/dashboard/components/ProductionPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "تولید و درآمد" };

export default function ProductionPage() {
  return <ProductionPageContent />;
}
