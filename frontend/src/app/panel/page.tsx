import type { Metadata } from "next";
import { PanelHome } from "@/features/panel/panel-home";

export const metadata: Metadata = {
  title: "خانه پنل",
  description: "گام بعدی، قراردادها و نیروگاه‌های حساب شما در برقینو.",
};

export default function PanelHomePage() {
  return <PanelHome />;
}
