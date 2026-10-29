import type { Metadata } from "next";
import { WorkspaceLockedSection } from "@/features/workspace/workspace-locked-section";
export const metadata: Metadata = { title: "تولید و درآمد" };
export default function LockedPage() { return <WorkspaceLockedSection title="تولید و درآمد" />; }
