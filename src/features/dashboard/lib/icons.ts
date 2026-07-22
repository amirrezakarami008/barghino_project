import {
  BarChart3,
  Bell,
  CreditCard,
  FileCheck,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  Receipt,
  Settings,
  ShoppingCart,
  User,
  type LucideIcon,
} from "lucide-react";
import type { DashboardNavIcon } from "@/shared/types/dashboard";

const DASHBOARD_ICON_MAP: Record<DashboardNavIcon, LucideIcon> = {
  LayoutDashboard,
  FileText,
  BarChart3,
  FileCheck,
  ShoppingCart,
  Receipt,
  CreditCard,
  Bell,
  Headphones,
  FolderOpen,
  User,
  Settings,
};

export function getDashboardIcon(name: DashboardNavIcon): LucideIcon {
  return DASHBOARD_ICON_MAP[name];
}

export {
  BarChart3,
  Bell,
  CreditCard,
  FileCheck,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  Receipt,
  Settings,
  ShoppingCart,
  User,
};
