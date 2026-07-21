export type DashboardNavIcon =
  | "LayoutDashboard"
  | "FileText"
  | "BarChart3"
  | "FileCheck"
  | "ShoppingCart"
  | "Receipt"
  | "CreditCard"
  | "Bell"
  | "Headphones"
  | "FolderOpen"
  | "User"
  | "Settings";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: DashboardNavIcon;
  badge?: number;
}

export interface DashboardUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationalId: string;
  company?: string;
  role: "personal" | "business";
  avatar?: string;
  memberSince: string;
  verified: boolean;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: DashboardNavIcon;
  color: "blue" | "green" | "amber" | "violet";
}

export interface BillAccount {
  id: string;
  name: string;
  billId: string;
  type: "صنعتی" | "تجاری" | "اداری" | "مسکونی";
  demand: string;
  monthlyUsage: string;
  status: "active" | "pending" | "inactive";
  address: string;
}

export interface Contract {
  id: string;
  title: string;
  billAccount: string;
  type: string;
  startDate: string;
  endDate: string;
  volume: string;
  rate: string;
  status: "active" | "pending" | "expired" | "draft";
  savings: string;
}

export interface Invoice {
  id: string;
  number: string;
  billAccount: string;
  period: string;
  amount: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paidDate?: string;
}

export interface Payment {
  id: string;
  title: string;
  amount: string;
  date: string;
  method: "درگاه بانکی" | "اعتبار" | "اقساط";
  status: "success" | "pending" | "failed";
  reference: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success" | "billing";
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdate: string;
  messages: number;
}

export interface Document {
  id: string;
  title: string;
  type: "قرارداد" | "فاکتور" | "گواهی" | "مجوز";
  date: string;
  size: string;
}

export interface ConsumptionPoint {
  label: string;
  usage: number;
  cost: number;
  peak?: number;
}

export interface PowerPackage {
  id: string;
  name: string;
  description: string;
  duration: string;
  savings: string;
  features: string[];
  recommended?: boolean;
}

export interface QuickAction {
  label: string;
  href: string;
  icon: DashboardNavIcon;
  description: string;
}
