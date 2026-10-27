import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";
import { ProfileDetails } from "@/features/workspace/profile-details";

export const metadata: Metadata = { title: "پروفایل" };

export default function ProfilePage() {
  return (
    <WorkspacePage
      icon="user"
      title="پروفایل من"
      lede="اطلاعات حساب از سرویس هویت دریافت می‌شود."
    >
      <ProfileDetails />
    </WorkspacePage>
  );
}
