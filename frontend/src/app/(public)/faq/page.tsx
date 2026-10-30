import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "پرسش‌ها",
  description: "پرسش‌های رایج درباره فروش برق و نصب نیروگاه در برقینو.",
};

/** Legacy URL — FAQ lives on /learn */
export default function FaqPage() {
  redirect("/learn");
}
