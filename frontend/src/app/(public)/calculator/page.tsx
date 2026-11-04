import type { Metadata } from "next";
import { PlantCalculator } from "@/features/marketing/plant-calculator";

export const metadata: Metadata = {
  title: "ماشین حساب نیروگاه",
  description: "برآورد هزینه تجهیزات نصب نیروگاه خورشیدی بر اساس ظرفیت و کاتالوگ فعال برقینو.",
};

export default function CalculatorPage() {
  return <PlantCalculator />;
}
