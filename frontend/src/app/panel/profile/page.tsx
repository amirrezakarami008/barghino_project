import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "پروفایل" };

export default function ProfilePage() {
  return (
    <WorkspacePage
      icon="user"
      title="پروفایل خالی است"
      lede="نام، موبایل و مسیر فروش یا نصب بعد از ساخت حساب واقعی از سرویس هویت خوانده می‌شود."
      action={{ href: "/register", label: "ثبت‌نام" }}
    />
  );
}
