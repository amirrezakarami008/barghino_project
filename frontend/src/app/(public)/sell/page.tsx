import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "فروش برق",
  description: "مسیر فروش برق نیروگاه خانگی در برقینو.",
};

/** Legacy URL — canonical content lives under /services */
export default function SellPage() {
  redirect("/services");
}
