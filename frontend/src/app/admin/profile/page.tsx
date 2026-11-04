import type { Metadata } from "next";
import { AdminProfile } from "@/features/admin/admin-profile";

export const metadata: Metadata = { title: "پروفایل مدیر" };

export default function AdminProfilePage() {
  return <AdminProfile />;
}
