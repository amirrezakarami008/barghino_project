import type { Metadata } from "next";
import { HomeView } from "@/features/marketing/home-view";

export const metadata: Metadata = {
  title: { absolute: "برقینو | فروش شفاف برق خانگی و نصب نیروگاه خورشیدی" },
  description:
    "برقینو مسیر فروش برق نیروگاه خانگی و نصب پنل خورشیدی را شفاف و قابل‌پیگیری می‌کند؛ بدون وعدهٔ درآمد تضمینی.",
  openGraph: {
    title: "برقینو",
    description: "مسیر شفاف فروش برق خانگی و نصب نیروگاه خورشیدی",
    locale: "fa_IR",
    type: "website",
  },
};

export default function HomePage() {
  return <HomeView />;
}
