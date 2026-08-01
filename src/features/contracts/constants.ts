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
    title: "قرارداد فروش برق — نیروگاه پشت‌بام",
    billAccount: "نیروگاه پشت‌بام خانه اصلی",
    type: "فروش برق خانگی",
    startDate: "۱۴۰۴/۰۱/۱۵",
    endDate: "۱۴۰۴/۱۲/۲۹",
    volume: "۷۲۰ kWh/ماه",
    rate: "۱۵٬۰۰۰ تومان/kWh",
    status: "active",
    savings: "≈۳× دولت",
    roleScope: "personal",
    expiresSoon: false,
    notes: "فروش به نرخ بورس سبز — پرداخت حداکثر ۲ ماه",
    files: [
      seedFile("c1-f1", "قرارداد-فروش-برق-پشت‌بام.pdf", "system", "۱.۸ MB", 1_800_000, "۱۴۰۴/۰۱/۱۵", 1),
    ],
    versions: [
      {
        id: "c1-v1",
        version: 1,
        label: "نسخه اولیه",
        date: "۱۴۰۴/۰۱/۱۵",
        note: "عقد قرارداد فروش برق خانگی",
        fileId: "c1-f1",
      },
    ],
  },
  {
    id: "c2",
    title: "قرارداد فروش برق — ویلا کرج",
    billAccount: "نیروگاه ویلا — کرج",
    type: "فروش برق خانگی",
    startDate: "۱۴۰۴/۰۴/۰۱",
    endDate: "۱۴۰۵/۰۳/۳۱",
    volume: "۴۸۰ kWh/ماه",
    rate: "۱۵٬۰۰۰ تومان/kWh",
    status: "active",
    savings: "≈۳× دولت",
    roleScope: "personal",
    expiresSoon: false,
    notes: "نیروگاه دوم پس از نصب فعال شد",
    files: [
      seedFile("c2-f1", "قرارداد-فروش-برق-ویلا.pdf", "system", "۱.۵ MB", 1_500_000, "۱۴۰۴/۰۴/۰۱", 1),
    ],
    versions: [
      {
        id: "c2-v1",
        version: 1,
        label: "نسخه اولیه",
        date: "۱۴۰۴/۰۴/۰۱",
        note: "عقد قرارداد پس از راه‌اندازی",
        fileId: "c2-f1",
      },
    ],
  },
  {
    id: "c3",
    title: "پیش‌نویس قرارداد فروش — انشعاب جدید",
    billAccount: "در انتظار معرفی نیروگاه",
    type: "فروش برق خانگی",
    startDate: "—",
    endDate: "—",
    volume: "—",
    rate: "بورس سبز",
    status: "draft",
    savings: "—",
    roleScope: "personal",
    notes: "پس از معرفی نیروگاه تکمیل می‌شود",
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
    title: "قرارداد نصب نیروگاه — ویلا کرج",
    billAccount: "ویلا — کرج",
    type: "نصب نیروگاه خورشیدی",
    startDate: "۱۴۰۴/۰۲/۱۰",
    endDate: "۱۴۰۴/۰۳/۲۸",
    volume: "۴ kWp",
    rate: "—",
    status: "expired",
    savings: "—",
    roleScope: "personal",
    notes: "نصب تکمیل و به قرارداد فروش تبدیل شد",
    files: [
      seedFile("c4-f1", "قرارداد-نصب-ویلا.pdf", "system", "۹۲۰ KB", 920_000, "۱۴۰۴/۰۲/۱۰", 1),
    ],
    versions: [
      {
        id: "c4-v1",
        version: 1,
        label: "نسخه اولیه",
        date: "۱۴۰۴/۰۲/۱۰",
        note: "عقد قرارداد نصب",
        fileId: "c4-f1",
      },
    ],
  },
  {
    id: "c5",
    title: "قرارداد فروش در انتظار امضا",
    billAccount: "نیروگاه پشت‌بام خانه اصلی",
    type: "فروش برق خانگی",
    startDate: "۱۴۰۴/۰۸/۰۱",
    endDate: "۱۴۰۵/۰۷/۳۱",
    volume: "۷۲۰ kWh/ماه",
    rate: "۱۵٬۰۰۰ تومان/kWh",
    status: "pending",
    savings: "≈۳× دولت",
    roleScope: "personal",
    notes: "پس از امضا، نسخه امضاشده را بارگذاری کنید",
    files: [
      seedFile("c5-f1", "پیش‌نویس-فروش-آماده-امضا.pdf", "system", "۱.۱ MB", 1_100_000, "۱۴۰۴/۰۷/۲۰", 1),
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
