import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "نیروگاه من" };

export default function PlantPage() {
  return (
    <WorkspacePage
      icon="plant"
      title="نیروگاهی ثبت نشده"
      lede="نام، ظرفیت، آدرس و انشعاب بعد از معرفی نیروگاه اینجا می‌آید. تا اتصال سرویس، فرم ذخیره‌ای وجود ندارد."
    />
  );
}
