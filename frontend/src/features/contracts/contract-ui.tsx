import type { ReactElement, ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { localDate, type Contract } from "./contract-model";

const statuses: Record<string, { label: string; tone: string; icon: IconName; next: string }> = {
  draft: { label: "پیش‌نویس", tone: "blue", icon: "edit", next: "مشخصات را بررسی کنید؛ امضا پس از ارائهٔ سند نهایی ممکن می‌شود." },
  pending: { label: "در انتظار شرکت", tone: "violet", icon: "clock", next: "امضای شما ثبت شده است. قرارداد منتظر تصمیم شرکت است." },
  active: { label: "فعال", tone: "emerald", icon: "check", next: "شرکت قرارداد را تأیید کرده است." },
  cancelled: { label: "بسته‌شده", tone: "coral", icon: "close", next: "این نسخه بسته شده است؛ برای ادامه، اطلاعات را بررسی و پیش‌نویس جدیدی ایجاد کنید." },
  expired: { label: "منقضی‌شده", tone: "amber", icon: "clock", next: "اعتبار این قرارداد به پایان رسیده است. تمدید در این بخش در دسترس نیست." },
};
const fallback = { label: "وضعیت نامشخص", tone: "neutral", icon: "shield" as const, next: "وضعیت این قرارداد قابل تشخیص نیست. اطلاعات را تازه‌سازی کنید یا با پشتیبانی تماس بگیرید." };
export function statusInfo(status: string): typeof fallback | typeof statuses[string] { return Object.hasOwn(statuses, status) ? statuses[status] ?? fallback : fallback; }
export function ContractStatus({ status }: { readonly status: string }): ReactElement {
  const info = statusInfo(status);
  return <span className={`contract-status contract-tone-${info.tone}`}><Icon name={info.icon} className="size-4" />{info.label}</span>;
}
export function ContractError({ message, retry }: { readonly message: string; readonly retry?: () => void }): ReactElement {
  return <div className="contract-feedback contract-feedback-error" role="alert"><Icon name="shield" className="size-5 shrink-0" /><div><p>{message}</p>{retry ? <Button variant="secondary" onClick={retry} className="mt-3">تلاش دوباره</Button> : null}</div></div>;
}
export function ContractEmpty({ title, children, icon = "file" }: { readonly title: string; readonly children: ReactNode; readonly icon?: IconName }): ReactElement {
  return <div className="contract-empty"><span className="contract-empty-icon"><Icon name={icon} className="size-7" /></span><h3>{title}</h3><div>{children}</div></div>;
}
export function ContractDate({ value }: { readonly value: string }): ReactElement { return value ? <time dateTime={value}>{localDate(value)}</time> : <span>ثبت نشده</span>; }
export function ContractPagination({ page, count, next, previous, onChange }: { readonly page: number; readonly count: number; readonly next: boolean; readonly previous: boolean; readonly onChange: (page: number) => void }): ReactElement {
  return <nav className="contract-pagination" aria-label="صفحه‌بندی"><Button variant="secondary" disabled={!previous} onClick={() => onChange(Math.max(1, page - 1))}>قبلی</Button><span>صفحهٔ {page.toLocaleString("fa-IR")} · {count.toLocaleString("fa-IR")} مورد</span><Button variant="secondary" disabled={!next} onClick={() => onChange(page + 1)}>بعدی</Button></nav>;
}
export function contractSummaryDate(contract: Contract): string { return contract.reviewedAt || contract.signedAt || contract.createdAt; }
