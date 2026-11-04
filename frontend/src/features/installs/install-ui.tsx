import type { ReactElement } from "react";
import { Alert, Button } from "@/components/ui";
import { formatFaNumber } from "@/shared/lib/fa";

export function InstallError({
  message,
  retry,
}: {
  readonly message: string;
  readonly retry?: () => void;
}): ReactElement {
  return (
    <div className="panel-surface">
      <Alert tone="danger" title="دریافت اطلاعات کامل نشد">
        <p>{message}</p>
        {retry ? (
          <Button variant="secondary" onClick={retry} className="mt-3">
            تلاش دوباره
          </Button>
        ) : null}
      </Alert>
    </div>
  );
}

export function InstallPagination({
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
    <nav className="installs-pagination" aria-label="صفحه‌بندی">
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
