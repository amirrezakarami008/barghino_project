import type { Metadata } from "next";
import { MetricGrid, WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "مدیریت" };

export default function AdminHomePage() {
  return (
    <WorkspacePage
      title="کارهای مدیر"
      lede="بررسی نصب، تجهیزات، پلن و مجله از همین‌جا باز می‌شوند. تا اتصال صف واقعی، شمارنده ساختگی نمی‌گذاریم."
      icon="home"
    >
      <MetricGrid
        items={[
          { label: "درخواست نصب", hint: "منتظر بررسی" },
          { label: "تجهیزات", hint: "کاتالوگ قیمت" },
          { label: "پلن فروش", hint: "نرخ و حجم تعهد" },
          { label: "مجله", hint: "پیش‌نویس و انتشار" },
        ]}
      />
    </WorkspacePage>
  );
}
