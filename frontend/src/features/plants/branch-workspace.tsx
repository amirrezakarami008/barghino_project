"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Skeleton,
  StatusPill,
} from "@/components/ui";
import { plantStatusMeta } from "@/features/contracts/status-map";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { usePlantInventory } from "./use-plant-inventory";

export function BranchWorkspace(): ReactElement {
  const [page, setPage] = useState(1);
  const { state, reload } = usePlantInventory(page, 1);

  return (
    <div className="panel-page space-y-6">
      <header className="panel-page-header flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-h2 tracking-tight">انشعاب‌های من</h2>
          <p className="mt-2 text-body text-foreground-muted">
            شناسه قبض، نشانی و وضعیت بررسی — فقط دادهٔ واقعی حساب شما.
          </p>
        </div>
        <Button variant="secondary" onClick={reload}>
          تازه‌سازی
        </Button>
      </header>

      {state.status === "loading" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : state.status === "error" ? (
        <Alert tone="danger" title="دریافت انشعاب‌ها ممکن نشد">
          <p>{state.message}</p>
          <Button variant="secondary" className="mt-3" onClick={reload}>
            تلاش دوباره
          </Button>
        </Alert>
      ) : !state.data.branches.results.length ? (
        <div className="panel-surface grid justify-items-center gap-3 py-8 text-center">
          <PanelArt
            name="energy-bulb"
            width={160}
            height={160}
            className="size-36 rounded-[22px] object-cover shadow-[var(--panel-float)]"
          />
          <EmptyState
            hideIcon
            className="border-0 bg-transparent p-0 shadow-none"
            title="هنوز انشعابی ثبت نشده است"
            description="ابتدا انشعاب را در مسیر قرارداد تعریف کنید؛ بعد از آن می‌توانید نیروگاه را روی همان انشعاب ثبت کنید."
            icon="home"
            action={<ButtonLink href="/panel/contracts/new">ثبت انشعاب</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <p className="text-caption text-foreground-muted">
            {faNumber(state.data.branches.count)} انشعاب ثبت‌شده
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {state.data.branches.results.map((branch) => {
              const meta = plantStatusMeta(branch.status);
              return (
                <li key={branch.uuid}>
                  <Card className="h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <span className="grid size-11 place-items-center rounded-md bg-grad-volt text-accent-foreground">
                          <Icon name="home" className="size-5" />
                        </span>
                        <div>
                          <h3 className="text-h4">{branch.name}</h3>
                          <p className="mt-1 text-sm tabular-nums text-foreground-muted">
                            شناسه قبض · <bdi dir="ltr">{branch.bill_id}</bdi>
                          </p>
                        </div>
                      </div>
                      <StatusPill status={meta.tone} label={meta.label} />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-foreground-muted">{branch.address}</p>
                    {branch.review_note ? (
                      <p className="mt-3 rounded-md bg-status-pending-bg px-3 py-2 text-sm text-status-pending">
                        نتیجهٔ بررسی: {branch.review_note}
                      </p>
                    ) : null}
                  </Card>
                </li>
              );
            })}
          </ul>
          {state.data.branches.next || state.data.branches.previous ? (
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                disabled={!state.data.branches.previous}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                قبلی
              </Button>
              <span className="text-caption">صفحهٔ {faNumber(page)}</span>
              <Button
                variant="ghost"
                disabled={!state.data.branches.next}
                onClick={() => setPage((current) => current + 1)}
              >
                بعدی
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
