import type { Metadata } from "next";
import { WorkspaceLockedSection } from "@/features/workspace/workspace-locked-section";
export const metadata: Metadata = { title: "مدارک" };
export default function LockedPage() { return <WorkspaceLockedSection title="مدارک" />; }
