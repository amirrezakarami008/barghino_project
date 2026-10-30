import { formatFaNumber } from "@/shared/lib/fa";
import type { ReactElement, ReactNode } from "react";
import { Alert, Button, EmptyState } from "@/components/ui";
import type { IconName } from "@/shared/ui/icon";
import { localDate, type Contract } from "./contract-model";
import { contractStatusMeta } from "./status-map";

export function statusInfo(status: string) {
  const meta = contractStatusMeta(status);
  return { label: meta.label, tone: meta.tone, next: meta.next };
}

export function ContractStatus({ status }: { readonly status: string }): ReactElement {
  const info = statusInfo(status);
  return <span className="text-sm font-semibold">{info.label}</span>;
}

export function ContractError({
  message,
  retry,
}: {
  readonly message: string;
  readonly retry?: () => void;
}): ReactElement {
  return (
    <Alert tone="danger" title="خطا">
      <p>{message}</p>
      {retry ? (
        <Button variant="secondary" onClick={retry} className="mt-3">
          تلاش دوباره
        </Button>
      ) : null}
    </Alert>
  );
}

export function ContractEmpty({
  title,
  children,
  icon = "file",
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly icon?: IconName;
}): ReactElement {
  return (
    <EmptyState title={title} icon={icon} description={typeof children === "string" ? children : undefined}>
      {typeof children === "string" ? null : children}
    </EmptyState>
  );
}

export function ContractDate({ value }: { readonly value: string }): ReactElement {
  return value ? <time dateTime={value}>{localDate(value)}</time> : <span>ثبت نشده</span>;
}

export function ContractPagination({
  page,
  count,
  next,
  previous,
  onChange,
}: {
  readonly page: number;
  readonly count: number;
  readonly next: boolean;
  readonly previous: boolean;
  readonly onChange: (page: number) => void;
}): ReactElement {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="صفحه‌بندی">
      <Button variant="secondary" disabled={!previous} onClick={() => onChange(Math.max(1, page - 1))}>
        قبلی
      </Button>
      <span className="text-caption text-foreground-muted">
        صفحهٔ {formatFaNumber(page)} · {formatFaNumber(count)} مورد
      </span>
      <Button variant="secondary" disabled={!next} onClick={() => onChange(page + 1)}>
        بعدی
      </Button>
    </nav>
  );
}

export function contractSummaryDate(contract: Contract): string {
  return contract.reviewedAt || contract.signedAt || contract.createdAt;
}
