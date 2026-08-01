import type {
  Document,
  HomeSubscription,
  InstallRequest,
  Notification,
  Payment,
  ProductionPoint,
  SellInvoice,
  SolarPlant,
  SupportTicket,
} from "@/shared/types/dashboard";
import { SEED_CONTRACTS } from "@/features/contracts/constants";

export const CONTRACTS = SEED_CONTRACTS;

/** نیروگاه‌های خورشیدی ثبت‌شده */
export const SOLAR_PLANTS: SolarPlant[] = [
  {
    id: "sp1",
    name: "نیروگاه پشت‌بام خانه اصلی",
    address: "تهران، شهرک غرب، خیابان ایران‌زمین",
    capacityKwp: 6,
    monthlyProductionKwh: 720,
    startDate: "۱۴۰۴/۰۱/۱۵",
    status: "active",
    meterNumber: "۱۴۵۲۳۶۷۸",
  },
  {
    id: "sp2",
    name: "نیروگاه ویلا — کرج",
    address: "کرج، محله مهرشهر",
    capacityKwp: 4,
    monthlyProductionKwh: 480,
    startDate: "۱۴۰۴/۰۴/۰۱",
    status: "active",
    meterNumber: "۹۸۷۶۵۴۳۲",
  },
];

/** انشعاب‌های خانگی ثبت‌شده */
export const HOME_SUBSCRIPTIONS: HomeSubscription[] = [
  {
    id: "hs1",
    name: "خانه اصلی — تهران",
    meterNumber: "۱۴۵۲۳۶۷۸",
    address: "تهران، شهرک غرب",
    status: "active",
  },
  {
    id: "hs2",
    name: "ویلا — کرج",
    meterNumber: "۹۸۷۶۵۴۳۲",
    address: "کرج، مهرشهر",
    status: "active",
  },
];

/** نقاط تولید ماهانه برای نمودار */
export const MONTHLY_PRODUCTION: ProductionPoint[] = [
  { label: "فروردین", production: 690, earnings: 10_350_000 },
  { label: "اردیبهشت", production: 740, earnings: 11_100_000 },
  { label: "خرداد", production: 810, earnings: 12_150_000 },
  { label: "تیر", production: 870, earnings: 13_050_000 },
  { label: "مرداد", production: 850, earnings: 12_750_000 },
  { label: "شهریور", production: 720, earnings: 10_800_000 },
];

/** صورت‌حساب‌های درآمد فروش برق */
export const SELL_INVOICES: SellInvoice[] = [
  {
    id: "si1",
    number: "SEL-۱۴۰۴-۰۶-۰۰۱",
    plantName: "نیروگاه پشت‌بام خانه اصلی",
    period: "شهریور ۱۴۰۴",
    energyKwh: "۷۲۰",
    ratePerKwh: "۱۵٬۰۰۰",
    amount: "۱۰٬۸۰۰٬۰۰۰",
    dueDate: "۱۴۰۴/۰۸/۰۱",
    status: "pending",
  },
  {
    id: "si2",
    number: "SEL-۱۴۰۴-۰۶-۰۰۲",
    plantName: "نیروگاه ویلا — کرج",
    period: "شهریور ۱۴۰۴",
    energyKwh: "۴۸۰",
    ratePerKwh: "۱۵٬۰۰۰",
    amount: "۷٬۲۰۰٬۰۰۰",
    dueDate: "۱۴۰۴/۰۸/۰۱",
    status: "pending",
  },
  {
    id: "si3",
    number: "SEL-۱۴۰۴-۰۵-۰۰۱",
    plantName: "نیروگاه پشت‌بام خانه اصلی",
    period: "مرداد ۱۴۰۴",
    energyKwh: "۸۵۰",
    ratePerKwh: "۱۵٬۰۰۰",
    amount: "۱۲٬۷۵۰٬۰۰۰",
    dueDate: "۱۴۰۴/۰۷/۰۱",
    status: "paid",
    paidDate: "۱۴۰۴/۰۶/۲۸",
  },
];

export const PAYMENTS: Payment[] = [
  {
    id: "p1",
    title: "پرداخت فروش مرداد — پشت‌بام خانه اصلی",
    amount: "۱۲٬۷۵۰٬۰۰۰",
    date: "۱۴۰۴/۰۶/۲۸",
    method: "واریز مستقیم",
    status: "success",
    reference: "BRQ-۸۴۷۲۹۱",
  },
  {
    id: "p2",
    title: "پرداخت فروش تیر — ویلا کرج",
    amount: "۸٬۸۵۰٬۰۰۰",
    date: "۱۴۰۴/۰۶/۰۲",
    method: "واریز مستقیم",
    status: "success",
    reference: "BRQ-۸۴۷۳۵۶",
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "صورت‌حساب شهریور آماده است",
    message: "درآمد شهریور نیروگاه پشت‌بام: ۱۰٬۸۰۰٬۰۰۰ تومان — حداکثر تا ۱ آبان پرداخت می‌شود.",
    date: "۱۴۰۴/۰۷/۰۱",
    read: false,
    type: "billing",
  },
  {
    id: "n2",
    title: "تولید بالاتر از هدف",
    message: "تولید تیر نیروگاه خانه اصلی ۱۲٪ بیشتر از هدف بود.",
    date: "۱۴۰۴/۰۵/۰۲",
    read: false,
    type: "success",
  },
  {
    id: "n3",
    title: "قرارداد فروش برق فعال شد",
    message: "قرارداد فروش برق نیروگاه ویلا کرج از امروز فعال است.",
    date: "۱۴۰۴/۰۴/۰۱",
    read: true,
    type: "success",
  },
  {
    id: "n4",
    title: "تکمیل مدارک لازم",
    message: "برای قرارداد دوم، کپی سند مالکیت ملک را در بخش مدارک بارگذاری کنید.",
    date: "۱۴۰۴/۰۳/۲۵",
    read: true,
    type: "info",
  },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "t1",
    subject: "سوال درباره نرخ بورس سبز ماه بعد",
    category: "فروش برق",
    status: "in_progress",
    priority: "medium",
    createdAt: "۱۴۰۴/۰۶/۲۵",
    lastUpdate: "۱۴۰۴/۰۶/۲۷",
    messages: 3,
  },
  {
    id: "t2",
    subject: "پیگیری وضعیت نصب نیروگاه ویلا",
    category: "نصب نیروگاه",
    status: "resolved",
    priority: "low",
    createdAt: "۱۴۰۴/۰۳/۱۰",
    lastUpdate: "۱۴۰۴/۰۳/۲۲",
    messages: 5,
  },
];

export const DOCUMENTS: Document[] = [
  {
    id: "d1",
    title: "قرارداد فروش برق — نیروگاه پشت‌بام",
    type: "قرارداد",
    date: "۱۴۰۴/۰۱/۱۵",
    size: "۱.۸ MB",
  },
  {
    id: "d2",
    title: "صورت‌حساب مرداد ۱۴۰۴",
    type: "فاکتور",
    date: "۱۴۰۴/۰۶/۰۱",
    size: "۳۲۰ KB",
  },
  {
    id: "d3",
    title: "گواهی اتصال به شبکه",
    type: "گواهی",
    date: "۱۴۰۴/۰۱/۱۰",
    size: "۴۸۰ KB",
  },
];

/** درخواست نصب نیروگاه در جریان */
export const INSTALL_REQUESTS: InstallRequest[] = [];
