import type { Metadata } from "next";
import { AdminPlants } from "@/features/admin/admin-plants";
export const metadata: Metadata = { title: "مدیریت نیروگاه‌ها" };
export default function PlantsAdminPage() { return <AdminPlants />; }
