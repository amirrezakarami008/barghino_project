import type { Metadata } from "next";
import { BranchWorkspace } from "@/features/plants/branch-workspace";

export const metadata: Metadata = { title: "انشعاب‌های من" };
export default function BranchPage() {
  return <BranchWorkspace />;
}
