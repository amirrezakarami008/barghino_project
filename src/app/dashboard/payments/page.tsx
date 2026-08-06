import { PaymentsPageContent } from "@/features/payments";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "پرداخت‌ها" };

export default function PaymentsPage() {
  return <PaymentsPageContent />;
}
