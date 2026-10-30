import type { Metadata } from "next";
import { AdminPage } from "@/features/admin/admin-page";
import { ProfileDetails } from "@/features/workspace/profile-details";

export const metadata: Metadata = { title: "پروفایل مدیر" };

export default function AdminProfilePage() {
  return (
    <AdminPage title="حساب مدیر" description="مشخصات حساب، اطلاعات هویتی و وضعیت دسترسی شما.">
      <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
        <ProfileDetails />
      </div>
    </AdminPage>
  );
}
