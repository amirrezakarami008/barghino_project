import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  FileCheck,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  LineChart,
  Newspaper,
  Receipt,
  Settings,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { DashboardNavIcon } from "@/shared/types/dashboard";

const DASHBOARD_ICON_MAP: Record<DashboardNavIcon, LucideIcon> = {
  LayoutDashboard,
  Sun,
  BarChart3,
  FileCheck,
  Receipt,
  CreditCard,
  Bell,
  Headphones,
  FolderOpen,
  User,
  UserPlus,
  Settings,
  Newspaper,
  FileText,
  ClipboardList,
  TrendingUp,
  LineChart,
  Sparkles,
};

export function getDashboardIcon(name: DashboardNavIcon): LucideIcon {
  return DASHBOARD_ICON_MAP[name];
}

export {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  FileCheck,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  LineChart,
  Receipt,
  Settings,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  UserPlus,
};
