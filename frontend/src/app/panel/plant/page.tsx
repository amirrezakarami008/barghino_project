import type { Metadata } from "next";
import { PlantWorkspace } from "@/features/plants/plant-workspace";

export const metadata: Metadata = { title: "نیروگاه من" };
export default function PlantPage() { return <PlantWorkspace />; }
