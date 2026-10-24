import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "تجهیزات" };

export default function EquipmentPage() {
  return (
    <WorkspacePage
      icon="plant"
      title="کاتالوگ تجهیزات"
      lede="پنل، اینورتر و بقیه اقلام با قیمت تومان از سرویس کاتالوگ خوانده می‌شوند. این صفحه تا اتصال فهرست، قیمتی نشان نمی‌دهد."
    />
  );
}
