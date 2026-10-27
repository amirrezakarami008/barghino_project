import type { Metadata } from "next";
import { AdminJournal } from "@/features/admin/admin-journal";
import { articles } from "@/features/marketing/articles";

export const metadata: Metadata = { title: "مجله" };

export default function JournalPage() {
  return <AdminJournal articles={articles} />;
}
