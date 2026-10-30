import type { Metadata } from "next";
import { ProfileDetails } from "@/features/workspace/profile-details";

export const metadata: Metadata = {
  title: "پروفایل",
  description: "وضعیت موبایل، هویت و تأیید شرکت روی دارایی‌های شما.",
};

export default function ProfilePage() {
  return <ProfileDetails />;
}
