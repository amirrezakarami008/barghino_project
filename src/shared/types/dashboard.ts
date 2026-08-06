/** آیکون‌های مجاز برای سایدبار داشبورد */
export type DashboardNavIcon =
  | "LayoutDashboard"
  | "Sun"
  | "BarChart3"
  | "FileCheck"
  | "Receipt"
  | "CreditCard"
  | "Bell"
  | "Headphones"
  | "FolderOpen"
  | "User"
  | "UserPlus"
  | "Settings"
  | "Newspaper"
  | "FileText"
  | "ClipboardList"
  | "TrendingUp"
  | "LineChart"
  | "Sparkles";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: DashboardNavIcon;
  badge?: number;
  adminOnly?: boolean;
}

export interface DashboardUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationalId: string;
  company?: string;
  role: "personal" | "business";
  isAdmin?: boolean;
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

/** نیروگاه خورشیدی خانگی کاربر */
export interface SolarPlant {
  id: string;
  name: string;
  address: string;
  /** ظرفیت نصب‌شده kWp */
  capacityKwp: number;
  /** تولید ماه جاری kWh */
  monthlyProductionKwh: number;
  /** تاریخ راه‌اندازی */
  startDate: string;
  status: "active" | "pending" | "maintenance" | "inactive";
  /** انشعاب برق مرتبط */
  meterNumber: string;
}

/** اشتراک انشعاب خانگی برای فروش برق */
export interface HomeSubscription {
  id: string;
  name: string;
  meterNumber: string;
  address: string;
  status: "active" | "pending" | "inactive";
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
  status: "active" | "pending" | "expired" | "draft" | "cancelled";
  savings: string;
}

/** صورت‌حساب درآمد فروش برق به برقینو */
export interface SellInvoice {
  id: string;
  number: string;
  plantName: string;
  period: string;
  energyKwh: string;
  ratePerKwh: string;
  amount: string;
  dueDate: string;
  status: "paid" | "pending" | "processing";
  paidDate?: string;
}

export type PaymentMethod = "درگاه بانکی" | "واریز مستقیم" | "اعتبار";
export type PaymentStatus = "success" | "pending" | "failed" | "processing";

export interface Payment {
  id: string;
  title: string;
  amount: string;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  /** لینک به صورت‌حساب فروش */
  invoiceId?: string;
  invoiceNumber?: string;
  plantName?: string;
  period?: string;
  energyKwh?: string;
  ratePerKwh?: string;
  bankName?: string;
  bankLast4?: string;
  description?: string;
}

export interface PaymentMethodCard {
  id: string;
  title: string;
  subtitle: string;
  kind: "bank" | "credit" | "installment";
  active: boolean;
  meta?: string;
}

export interface UpcomingPayout {
  id: string;
  invoiceId: string;
  title: string;
  amount: string;
  dueDate: string;
  plantName: string;
  period: string;
  progressPercent: number;
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

/** نقاط تولید برای نمودار */
export interface ProductionPoint {
  label: string;
  /** برچسب کوتاه محور (اختیاری) */
  shortLabel?: string;
  production: number;
  earnings: number;
  /** میانگین تولید پشت‌بام‌های اطراف (kWh) */
  neighborProduction?: number;
  /** میانگین تولید پشت‌بام‌های کل کشور (kWh) */
  nationalProduction?: number;
}

/** مراحل درخواست نصب نیروگاه */
export type InstallRequestStep =
  | "submitted"
  | "review"
  | "visit"
  | "proposal"
  | "contract"
  | "installation"
  | "active";

export interface InstallStepEvent {
  step: InstallRequestStep;
  at: string;
  note?: string;
}

/** طرح پیشنهادی پس از بازدید */
export interface InstallProposal {
  capacityKwp: number;
  panelCount: number;
  estimatedCostToman: number;
  estimatedMonthlyKwh: number;
  estimatedMonthlyIncomeToman: number;
  visitSummary: string;
}

export interface InstallRequest {
  id: string;
  address: string;
  submittedAt: string;
  currentStep: InstallRequestStep;
  note?: string;
  phone?: string;
  areaM2?: number;
  history: InstallStepEvent[];
  scheduledVisitAt?: string;
  proposal?: InstallProposal;
  contractSignedAt?: string;
  /** نیروگاه ایجادشده پس از راه‌اندازی */
  plantId?: string;
}

/** نقاط مصرف — نگهداری برای سازگاری با ConsumptionChart */
export interface ConsumptionPoint {
  label: string;
  usage: number;
  cost: number;
  peak?: number;
}

export interface QuickAction {
  label: string;
  href: string;
  icon: DashboardNavIcon;
  description: string;
}
