import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "پلن‌ها" };

export default function PlansPage() {
  return (
    <WorkspacePage
      icon="coins"
      title="پلن‌های فروش"
      lede="نام، حجم تعهد و نرخ تومان بر کیلووات‌ساعت از سرویس پلن می‌آید. تا فعال شدن مقادیر واقعی، پلنی نمایش داده نمی‌شود."
    />
  );
}
