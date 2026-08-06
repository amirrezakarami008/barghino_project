import { SITE_CONFIG } from "@/config";
import type { Contract } from "../types";

export interface ContractPdfPayload {
  contract: Contract;
  party: {
    fullName: string;
    nationalId: string;
    birthCertificateNumber: string;
    phone: string;
    address: string;
  };
  nationalIdPhotoUrl?: string | null;
  contractNumber: string;
  signedAt: string;
}

/** متن مواد قرارداد برای نمایش و PDF */
export function getContractArticles(contract: Contract): string[] {
  const planLine = contract.planName
    ? ` پلن انتخابی «${contract.planName}».`
    : "";
  return [
    `ماده ۱ — طرفین قرارداد: «${SITE_CONFIG.name}» به‌عنوان خریدار برق تجدیدپذیر و طرف دوم به‌عنوان فروشنده برق تولیدی نیروگاه خانگی.`,
    `ماده ۲ — موضوع قرارداد: فروش برق تولیدی واحد «${contract.billAccount}» از نوع «${contract.type}» مطابق شرایط بورس سبز و سیاست‌های فصلی ${SITE_CONFIG.name}.${planLine}`,
    `ماده ۳ — دوره اعتبار: از ${contract.startDate === "—" ? "تاریخ امضا" : contract.startDate} تا ${contract.endDate === "—" ? "پایان دوره یک‌ساله" : contract.endDate}.`,
    `ماده ۴ — نرخ و حجم: نرخ نمونه ${contract.rate} و حجم توافقی ${contract.volume}. نرخ فصلی طبق اعلام سامانه قابل به‌روزرسانی است.`,
    `ماده ۵ — پرداخت: تسویه وجه فروش حداکثر ظرف ${SITE_CONFIG.valueProps.barghinoPayoutMonths} ماه پس از تأیید صورت‌حساب انجام می‌شود.`,
    `ماده ۶ — تعهدات فروشنده: ارائه اطلاعات هویتی صحیح، مدارک مالکیت/انشعاب، و همکاری در بازدید فنی.`,
    `ماده ۷ — تعهدات خریدار: خرید تضمینی طبق نرخ اعلامی فصلی و پرداخت به‌موقع پس از تأیید تولید.`,
    `ماده ۸ — فسخ: هر یک از طرفین می‌تواند با اخطار کتبی ۳۰ روزه و تسویه حساب‌های معوق، قرارداد را خاتمه دهد.`,
    `ماده ۹ — امضا: امضای الکترونیکی در سامانه ${SITE_CONFIG.name} به‌منزله پذیرش مفاد این قرارداد است.`,
  ];
}

export function buildContractNumber(contractId: string, date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = contractId.replace(/\W/g, "").toUpperCase().slice(0, 4) || "0000";
  // لاتین نگه داشته می‌شود تا در RTL به‌هم نریزد (با unicode-bidi در قالب)
  return `BGH-${y}${m}${d}-${suffix}`;
}
