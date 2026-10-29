import type { Metadata } from "next";
import { WorkspaceLockedSection } from "@/features/workspace/workspace-locked-section";
export const metadata: Metadata = { title: "پرداخت‌ها" };
export default function LockedPage() { return <WorkspaceLockedSection title="پرداخت‌ها" />; }
