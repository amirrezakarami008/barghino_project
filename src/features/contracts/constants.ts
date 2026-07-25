import type { Contract, ContractFileKind, ContractStatus } from "./types";

export const CONTRACTS_STORAGE_KEY = "barghma:contracts-v1";
export const CONTRACTS_EVENT = "barghma:contracts-updated";
export const CONTRACT_FILES_DB = "barghma-contract-files";
export const CONTRACT_FILES_STORE = "blobs";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_UPLOAD_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_UPLOAD_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,application/pdf,image/*";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  active: "فعال",
  pending: "در انتظار امضا",
  expired: "منقضی",
  draft: "پیش‌نویس",
  cancelled: "لغو‌شده",
};

export const CONTRACT_FILE_KIND_LABELS: Record<ContractFileKind, string> = {
  system: "نسخه سامانه",
  signed: "نسخه امضاشده",
  attachment: "پیوست",
  amendment: "الحاقیه",
};

export const CONTRACT_STATUS_FILTERS: { id: ContractStatus | "all"; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "active", label: "فعال" },
  { id: "pending", label: "در انتظار" },
  { id: "draft", label: "پیش‌نویس" },
  { id: "expired", label: "منقضی" },
  { id: "cancelled", label: "لغو‌شده" },
];

function seedFile(
  id: string,
  name: string,
  kind: ContractFileKind,
  size: string,
  sizeBytes: number,
  uploadedAt: string,
  version: number,
): Contract["files"][number] {
  return {
    id,
    name,
    kind,
    mimeType: "application/pdf",
    size,
    sizeBytes,
    uploadedAt,
    uploadedBy: "system",
    version,
    isSeed: true,
  };
}

export const SEED_CONTRACTS: Contract[] = [
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
    roleScope: "business",
    expiresSoon: false,
    notes: "قرارداد اصلی واحد صنعتی فولاد آریا",
    files: [
      seedFile("c1-f1", "قرارداد-تامین-۱۲ماهه-فولاد-آریا.pdf", "system", "۲.۴ MB", 2_400_000, "۱۴۰۴/۰۱/۰۱", 1),
      seedFile("c1-f2", "الحاقیه-تمدید-نسخه-۱.pdf", "amendment", "۴۸۰ KB", 480_000, "۱۴۰۴/۰۶/۲۵", 2),
    ],
    versions: [
      {
        id: "c1-v1",
        version: 1,
        label: "نسخه اولیه",
        date: "۱۴۰۴/۰۱/۰۱",
        note: "عقد قرارداد ۱۲ ماهه",
        fileId: "c1-f1",
      },
      {
        id: "c1-v2",
        version: 2,
        label: "الحاقیه تمدید",
        date: "۱۴۰۴/۰۶/۲۵",
        note: "تمدید تا پایان ۱۴۰۴",
        fileId: "c1-f2",
      },
    ],
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
    roleScope: "both",
    expiresSoon: true,
    notes: "نزدیک به پایان دوره — تمدید پیشنهاد می‌شود",
    files: [
      seedFile("c2-f1", "قرارداد-برق-سبز-دفتر-مرکزی.pdf", "system", "۱.۸ MB", 1_800_000, "۱۴۰۴/۰۷/۰۱", 1),
    ],
    versions: [
      {
        id: "c2-v1",
        version: 1,
        label: "نسخه اولیه",
        date: "۱۴۰۴/۰۷/۰۱",
        note: "عقد قرارداد برق سبز",
        fileId: "c2-f1",
      },
    ],
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
    roleScope: "business",
    notes: "برای تکمیل به بخش خرید برق بروید",
    files: [],
    versions: [
      {
        id: "c3-v1",
        version: 1,
        label: "پیش‌نویس",
        date: "۱۴۰۴/۰۶/۲۰",
        note: "ایجاد پیش‌نویس توسط کاربر",
      },
    ],
  },
  {
    id: "c4",
    title: "قرارداد کوتاه‌مدت ۳ ماهه",
    billAccount: "فروشگاه مرکزی",
    type: "قرارداد دوجانبه",
    startDate: "۱۴۰۳/۱۰/۰۱",
    endDate: "۱۴۰۳/۱۲/۲۹",
    volume: "۲,۰۰۰ kWh/ماه",
    rate: "۵,۲۰۰ ریال/kWh",
    status: "expired",
    savings: "۱۸٪",
    roleScope: "personal",
    files: [
      seedFile("c4-f1", "قرارداد-۳ماهه-فروشگاه.pdf", "system", "۹۲۰ KB", 920_000, "۱۴۰۳/۱۰/۰۱", 1),
    ],
    versions: [
      {
        id: "c4-v1",
        version: 1,
        label: "نسخه اولیه",
        date: "۱۴۰۳/۱۰/۰۱",
        note: "عقد قرارداد کوتاه‌مدت",
        fileId: "c4-f1",
      },
    ],
  },
  {
    id: "c5",
    title: "قرارداد در انتظار امضا",
    billAccount: "کارخانه فولاد آریا",
    type: "قرارداد دوجانبه",
    startDate: "۱۴۰۴/۰۸/۰۱",
    endDate: "۱۴۰۵/۰۷/۳۱",
    volume: "۸۰,۰۰۰ kWh/ماه",
    rate: "۴,۷۰۰ ریال/kWh",
    status: "pending",
    savings: "۳۵٪",
    roleScope: "business",
    notes: "پس از امضا، نسخه امضاشده را بارگذاری کنید",
    files: [
      seedFile("c5-f1", "پیش‌نویس-آماده-امضا.pdf", "system", "۱.۱ MB", 1_100_000, "۱۴۰۴/۰۷/۲۰", 1),
    ],
    versions: [
      {
        id: "c5-v1",
        version: 1,
        label: "پیش‌نویس امضا",
        date: "۱۴۰۴/۰۷/۲۰",
        note: "ارسال برای امضای طرفین",
        fileId: "c5-f1",
      },
    ],
  },
];
