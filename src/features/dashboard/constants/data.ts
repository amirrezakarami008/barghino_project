import type {
  BillAccount,
  ConsumptionPoint,
  Contract,
  Document,
  Invoice,
  Notification,
  Payment,
  PowerPackage,
  SupportTicket,
} from "@/shared/types/dashboard";

export const BILL_ACCOUNTS: BillAccount[] = [
  {
    id: "b1",
    name: "کارخانه فولاد آریا — خط تولید ۱",
    billId: "۱۲۳۴۵۶۷۸۹۰۱۲",
    type: "صنعتی",
    demand: "۲.۵ MW",
    monthlyUsage: "۸,۲۰۰ kWh",
    status: "active",
    address: "اصفهان، شهرک صنعتی مورچه‌خورت",
  },
  {
    id: "b2",
    name: "دفتر مرکزی — ساختمان اداری",
    billId: "۹۸۷۶۵۴۳۲۱۰۹۸",
    type: "اداری",
    demand: "۱۵۰ kW",
    monthlyUsage: "۴,۲۵۰ kWh",
    status: "active",
    address: "تهران، خیابان ولیعصر",
  },
  {
    id: "b3",
    name: "انبار جنوب — واحد توزیع",
    billId: "۵۵۵۵۶۶۶۶۷۷۷۸",
    type: "تجاری",
    demand: "۸۰ kW",
    monthlyUsage: "—",
    status: "pending",
    address: "شیراز، بلوار زند",
  },
];

export const CONTRACTS: Contract[] = [
  {
    id: "c1",
    title: "قرارداد تامین برق ۱۲ ماهه",
    billAccount: "کارخانه فولاد آریا",
    type: "قرارداد دوجانبه",
    startDate: "۱۴۰۴/۰۱/۰۱",
    endDate: "۱۴۰۴/۱۲/۲۹",
    volume: "۱۰۰,۰۰۰ kWh/ماه",
    rate: "۴,۸۵۰ ریال/kWh",
    status: "active",
    savings: "۳۲٪",
  },
  {
    id: "c2",
    title: "قرارداد برق سبز ۶ ماهه",
    billAccount: "دفتر مرکزی",
    type: "برق تجدیدپذیر",
    startDate: "۱۴۰۴/۰۷/۰۱",
    endDate: "۱۴۰۴/۱۲/۲۹",
    volume: "۵,۰۰۰ kWh/ماه",
    rate: "۵,۱۰۰ ریال/kWh",
    status: "active",
    savings: "۲۸٪",
  },
  {
    id: "c3",
    title: "پیش‌نویس قرارداد تامین خاموشی",
    billAccount: "انبار جنوب",
    type: "برق آزاد + گواهی اوج",
    startDate: "—",
    endDate: "—",
    volume: "۳,۰۰۰ kWh/ماه",
    rate: "در انتظار تایید",
    status: "draft",
    savings: "—",
  },
];

export const MONTHLY_CONSUMPTION: ConsumptionPoint[] = [
  { label: "فروردین", usage: 11200, cost: 54.2, peak: 890 },
  { label: "اردیبهشت", usage: 10800, cost: 52.1, peak: 850 },
  { label: "خرداد", usage: 13100, cost: 58.4, peak: 920 },
  { label: "تیر", usage: 14200, cost: 62.8, peak: 980 },
  { label: "مرداد", usage: 13800, cost: 61.2, peak: 960 },
  { label: "شهریور", usage: 12450, cost: 29.1, peak: 820 },
];

export const DAILY_CONSUMPTION: ConsumptionPoint[] = [
  { label: "شنبه", usage: 420, cost: 2.1, peak: 65 },
  { label: "یکشنبه", usage: 445, cost: 2.2, peak: 68 },
  { label: "دوشنبه", usage: 410, cost: 2.0, peak: 62 },
  { label: "سه‌شنبه", usage: 460, cost: 2.3, peak: 72 },
  { label: "چهارشنبه", usage: 435, cost: 2.1, peak: 66 },
  { label: "پنجشنبه", usage: 390, cost: 1.9, peak: 58 },
  { label: "جمعه", usage: 280, cost: 1.4, peak: 42 },
];

export const INVOICES: Invoice[] = [
  {
    id: "inv1",
    number: "INV-۱۴۰۴-۰۶-۰۰۱",
    billAccount: "کارخانه فولاد آریا",
    period: "شهریور ۱۴۰۴",
    amount: "۱۸,۴۵۰,۰۰۰",
    dueDate: "۱۴۰۴/۰۷/۱۵",
    status: "pending",
  },
  {
    id: "inv2",
    number: "INV-۱۴۰۴-۰۶-۰۰۲",
    billAccount: "دفتر مرکزی",
    period: "شهریور ۱۴۰۴",
    amount: "۱۰,۶۵۰,۰۰۰",
    dueDate: "۱۴۰۴/۰۷/۱۵",
    status: "pending",
  },
  {
    id: "inv3",
    number: "INV-۱۴۰۴-۰۵-۰۰۱",
    billAccount: "کارخانه فولاد آریا",
    period: "مرداد ۱۴۰۴",
    amount: "۱۹,۲۰۰,۰۰۰",
    dueDate: "۱۴۰۴/۰۶/۱۵",
    status: "paid",
    paidDate: "۱۴۰۴/۰۶/۱۰",
  },
  {
    id: "inv4",
    number: "INV-۱۴۰۴-۰۵-۰۰۲",
    billAccount: "دفتر مرکزی",
    period: "مرداد ۱۴۰۴",
    amount: "۱۱,۸۰۰,۰۰۰",
    dueDate: "۱۴۰۴/۰۶/۱۵",
    status: "paid",
    paidDate: "۱۴۰۴/۰۶/۱۲",
  },
];

export const PAYMENTS: Payment[] = [
  {
    id: "p1",
    title: "پرداخت فاکتور مرداد — فولاد آریا",
    amount: "۱۹,۲۰۰,۰۰۰",
    date: "۱۴۰۴/۰۶/۱۰",
    method: "درگاه بانکی",
    status: "success",
    reference: "BT-۸۴۷۲۹۱",
  },
  {
    id: "p2",
    title: "پرداخت فاکتور مرداد — دفتر مرکزی",
    amount: "۱۱,۸۰۰,۰۰۰",
    date: "۱۴۰۴/۰۶/۱۲",
    method: "اعتبار",
    status: "success",
    reference: "BT-۸۴۷۳۵۶",
  },
  {
    id: "p3",
    title: "پیش‌پرداخت قرارداد جدید",
    amount: "۵,۰۰۰,۰۰۰",
    date: "۱۴۰۴/۰۵/۲۰",
    method: "اقساط",
    status: "pending",
    reference: "BT-۸۴۶۱۰۲",
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "فاکتور شهریور آماده پرداخت",
    message: "فاکتور واحد فولاد آریا به مبلغ ۱۸,۴۵۰,۰۰۰ تومان صادر شد.",
    date: "۱۴۰۴/۰۷/۰۱",
    read: false,
    type: "billing",
  },
  {
    id: "n2",
    title: "هشدار اوج بار",
    message: "مصرف ساعت ۱۴ تا ۱۶ امروز ۱۵٪ بالاتر از میانگین است.",
    date: "۱۴۰۴/۰۶/۲۸",
    read: false,
    type: "warning",
  },
  {
    id: "n3",
    title: "قرارداد با موفقیت تمدید شد",
    message: "قرارداد ۱۲ ماهه فولاد آریا تا ۱۴۰۴/۱۲/۲۹ تمدید شد.",
    date: "۱۴۰۴/۰۶/۲۵",
    read: false,
    type: "success",
  },
  {
    id: "n4",
    title: "گزارش ماهانه مصرف",
    message: "گزارش تحلیلی مصرف شهریور در بخش مصرف و تحلیل آماده است.",
    date: "۱۴۰۴/۰۶/۲۰",
    read: true,
    type: "info",
  },
  {
    id: "n5",
    title: "پاسخ تیکت پشتیبانی",
    message: "تیکت #۱۲۴۵ توسط کارشناس پاسخ داده شد.",
    date: "۱۴۰۴/۰۶/۱۸",
    read: true,
    type: "info",
  },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "t1",
    subject: "سوال درباره تعرفه قرارداد جدید",
    category: "مشاوره خرید",
    status: "in_progress",
    priority: "medium",
    createdAt: "۱۴۰۴/۰۶/۲۵",
    lastUpdate: "۱۴۰۴/۰۶/۲۷",
    messages: 3,
  },
  {
    id: "t2",
    subject: "مشکل در نمایش مصرف روزانه",
    category: "پشتیبانی فنی",
    status: "resolved",
    priority: "low",
    createdAt: "۱۴۰۴/۰۶/۱۰",
    lastUpdate: "۱۴۰۴/۰۶/۱۲",
    messages: 5,
  },
];

export const DOCUMENTS: Document[] = [
  { id: "d1", title: "قرارداد تامین ۱۲ ماهه — فولاد آریا", type: "قرارداد", date: "۱۴۰۴/۰۱/۰۱", size: "۲.۴ MB" },
  { id: "d2", title: "قرارداد برق سبز — دفتر مرکزی", type: "قرارداد", date: "۱۴۰۴/۰۷/۰۱", size: "۱.۸ MB" },
  { id: "d3", title: "فاکتور شهریور — INV-۱۴۰۴-۰۶-۰۰۱", type: "فاکتور", date: "۱۴۰۴/۰۷/۰۱", size: "۴۵۶ KB" },
  { id: "d4", title: "گواهی تامین برق", type: "گواهی", date: "۱۴۰۴/۰۱/۰۱", size: "۳۲۰ KB" },
  { id: "d5", title: "پروانه خرده‌فروشی برق ما", type: "مجوز", date: "۱۴۰۲/۰۴/۰۱", size: "۱.۲ MB" },
];

export const POWER_PACKAGES: PowerPackage[] = [
  {
    id: "pkg1",
    name: "پایه",
    description: "مناسب مصرف‌کنندگان با دیماند زیر ۵۰۰ kW",
    duration: "۳ ماه",
    savings: "تا ۲۵٪",
    features: ["قرارداد دوجانبه", "پشتیبانی تلفنی", "گزارش ماهانه"],
  },
  {
    id: "pkg2",
    name: "حرفه‌ای",
    description: "برای واحدهای صنعتی و تجاری متوسط",
    duration: "۶ ماه",
    savings: "تا ۳۵٪",
    features: ["قرارداد دوجانبه", "مشاوره انرژی", "داشبورد تحلیلی", "خرید اعتباری"],
    recommended: true,
  },
  {
    id: "pkg3",
    name: "سازمانی",
    description: "راهکار جامع برای صنایع بزرگ",
    duration: "۱۲ ماه",
    savings: "تا ۶۰٪",
    features: ["قرارداد اختصاصی", "مدیر حساب", "برق سبز", "گواهی اوج", "SLA اختصاصی"],
  },
];
