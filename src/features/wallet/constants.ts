import type { WalletAccount, WalletTransaction } from "@/shared/types/dashboard";

export const WALLET_STORAGE_KEY = "barghino:wallet-v1";
export const WALLET_UPDATED_EVENT = "barghino:wallet-updated";

export const WALLET_KIND_LABELS: Record<WalletTransaction["kind"], string> = {
  sale_credit: "اعتبار فروش",
  deposit: "شارژ کیف پول",
  withdraw: "برداشت به شبا",
  refund: "بازگشت وجه",
  adjustment: "تعدیل",
};

/** موجودی اولیه مطابق کارت روش پرداخت در دادهٔ داشبورد */
export const SEED_WALLET_ACCOUNT: WalletAccount = {
  balanceToman: 2_450_000,
  pendingToman: 1_200_000,
  currency: "IRT",
  lastUpdatedAt: "۱۴۰۴/۰۷/۱۸",
};

export const SEED_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "wt1",
    title: "اعتبار فروش — مرداد پشت‌بام",
    amountToman: 12_750_000,
    date: "۱۴۰۴/۰۶/۲۵",
    direction: "in",
    kind: "sale_credit",
    status: "success",
    reference: "WLT-۹۲۰۱۱۴",
    invoiceId: "si3",
    note: "واریز درآمد فروش به کیف پول به‌جای شبا",
  },
  {
    id: "wt2",
    title: "برداشت به حساب ملت",
    amountToman: 8_000_000,
    date: "۱۴۰۴/۰۶/۲۸",
    direction: "out",
    kind: "withdraw",
    status: "success",
    reference: "WLT-۹۲۰۲۲۰",
    bankLast4: "۴۲۱۸",
    note: "برداشت موفق به شبا پیش‌فرض",
  },
  {
    id: "wt3",
    title: "شارژ کیف پول",
    amountToman: 500_000,
    date: "۱۴۰۴/۰۷/۰۲",
    direction: "in",
    kind: "deposit",
    status: "success",
    reference: "WLT-۹۲۰۳۳۱",
    note: "شارژ از درگاه بانکی (دمو)",
  },
  {
    id: "wt4",
    title: "برداشت در صف بانک",
    amountToman: 1_500_000,
    date: "۱۴۰۴/۰۷/۱۵",
    direction: "out",
    kind: "withdraw",
    status: "processing",
    reference: "WLT-۹۲۰۴۴۲",
    bankLast4: "۴۲۱۸",
    note: "در انتظار تأیید بانک مقصد",
  },
  {
    id: "wt5",
    title: "اعتبار فروش — تیر ویلا",
    amountToman: 6_400_000,
    date: "۱۴۰۴/۰۵/۲۰",
    direction: "in",
    kind: "sale_credit",
    status: "success",
    reference: "WLT-۹۱۹۸۰۱",
    invoiceId: "si5",
  },
  {
    id: "wt6",
    title: "برداشت ناموفق — اصلاح شبا",
    amountToman: 2_000_000,
    date: "۱۴۰۴/۰۳/۱۲",
    direction: "out",
    kind: "withdraw",
    status: "failed",
    reference: "WLT-۹۱۸۵۵۰",
    note: "شبا ناقص بود؛ مبلغ به موجودی برگشت",
  },
  {
    id: "wt7",
    title: "بازگشت وجه برداشت ناموفق",
    amountToman: 2_000_000,
    date: "۱۴۰۴/۰۳/۱۲",
    direction: "in",
    kind: "refund",
    status: "success",
    reference: "WLT-۹۱۸۵۵۱",
    note: "بازگشت خودکار پس از شکست واریز بانکی",
  },
];
