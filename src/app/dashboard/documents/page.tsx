import { DocumentsManager } from "@/features/documents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مدارک" };

export default function DocumentsPage() {
  return <DocumentsManager />;
}
