import type { Metadata } from "next";
import { HomeView } from "@/features/marketing/home-view";

export const metadata: Metadata = {
  title: { absolute: "برقینو" },
  description: "برق خانگی را با قرارداد رسمی و تسویه حداکثر دو ماه بفروشید. نیروگاه ندارید؟ مسیر نصب از برقینو شروع می‌شود.",
};

export default function HomePage() {
  return <HomeView />;
}
