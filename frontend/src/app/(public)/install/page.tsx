import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "نصب نیروگاه",
  description: "درخواست نصب نیروگاه خورشیدی خانگی در برقینو.",
};

/** Legacy URL — canonical content lives under /services#install */
export default function InstallPage() {
  redirect("/services");
}
