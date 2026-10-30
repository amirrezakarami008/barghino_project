"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  ConfirmDialog,
  DataTable,
  Input,
  Select,
  type DataTableColumn,
} from "@/components/ui";
import { formatDecimal } from "@/features/contracts";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import { AdminAuditLine, AdminPage, AdminSolidSurface } from "./admin-page";
import { AdminPlantForm } from "./admin-plant-form";
import {
  adminPlantError,
  deleteAdminPlant,
  getAdminPlants,
  plantStatusLabel,
  plantStatusTone,
  uncertainPlantMutation,
  type AdminPlant,
  type InventoryPage,
} from "./admin-plants-api";

type State =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: InventoryPage<AdminPlant> };

type Modal =
  | { readonly kind: "new" }
  | { readonly kind: "edit"; readonly plant: AdminPlant }
  | { readonly kind: "delete"; readonly plant: AdminPlant };

export function AdminPlants(): ReactElement {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [modal, setModal] = useState<Modal>();
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<{ readonly key: string; readonly state: State }>();
  const key = `${page}:${status}:${debounced}:${attempt}`;
  const state: State = result?.key === key ? result.state : { status: "loading" };

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debounced, status]);

  useEffect(() => {
    const controller = new AbortController();
    void getAdminPlants(page, status, debounced, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: adminPlantError(failure) } });
        }
      });
    return () => controller.abort();
  }, [key, page, status, debounced, attempt]);

  function reload(): void {
    setAttempt((value) => value + 1);
  }

  function saved(message: string): void {
    setNotice(message);
    setModal(undefined);
    setPage(1);
    reload();
  }

  const columns: DataTableColumn<AdminPlant>[] = [
    {
      id: "name",
      header: "نیروگاه",
      mobilePrimary: true,
      cell: (row) => <span className="font-semibold">{row.name}</span>,
    },
    {
      id: "owner",
      header: "مالک",
      cell: (row) => <bdi dir="ltr">{row.owner_phone || "—"}</bdi>,
    },
    {
      id: "capacity",
      header: "ظرفیت",
      cell: (row) => (
        <span dir="ltr">
          {formatDecimal(row.capacity_kwp)} kWp
        </span>
      ),
    },
    {
      id: "audit",
      header: "آخرین اقدام",
      cell: (row) => <AdminAuditLine text={row.lastAction} />,
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (row) => (
        <div className="flex flex-wrap gap-1" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setModal({ kind: "edit", plant: row })}>
            ویرایش
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setModal({ kind: "delete", plant: row })}>
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage
      title="نیروگاه‌ها"
      description="برای انشعاب موجود ثبت کنید، ویرایش کنید یا به‌صورت نرم حذف کنید. انتقال به انشعاب مالک دیگر ویرایش عادی نیست."
      headerAction={
        <Button variant="primary" onClick={() => setModal({ kind: "new" })}>
          <Icon name="plus" className="size-4" />
          ثبت نیروگاه
        </Button>
      }
    >
      <Alert tone="warning" title="هشدار انتقال مالکیت">
        جابه‌جایی نیروگاه به انشعاب متعلق به مالک دیگر مسیر عادی ویرایش نیست و از سمت سرویس رد می‌شود.
      </Alert>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Input
            label="جست‌وجوی نیروگاه"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="نام، موبایل مالک یا کنتور…"
          />
        </div>
        <div className="sm:w-56">
          <Select
            label="وضعیت"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { value: "all", label: "همهٔ وضعیت‌ها" },
              { value: "pending", label: "در انتظار بررسی" },
              { value: "active", label: "تأییدشده" },
              { value: "inactive", label: "ردشده / غیرفعال" },
              { value: "maintenance", label: "در حال تعمیر" },
            ]}
          />
        </div>
        <Button variant="secondary" onClick={reload}>
          تازه‌سازی
        </Button>
      </div>

      {notice ? <Alert tone="success" title={notice} /> : null}

      <AdminSolidSurface className="overflow-hidden">
        <DataTable
          columns={columns}
          rows={state.status === "ready" ? state.data.results : []}
          getRowId={(row) => row.uuid}
          statusAccessor={(row) => plantStatusTone(row.status)}
          loading={state.status === "loading"}
          emptyTitle="نیروگاهی پیدا نشد"
          emptyDescription="فیلتر را عوض کنید یا نیروگاه جدیدی روی انشعاب موجود ثبت کنید."
          onRowClick={(row) => setModal({ kind: "edit", plant: row })}
        />
        {state.status === "error" ? (
          <div className="p-4">
            <Alert tone="danger" title={state.message}>
              <Button variant="secondary" className="mt-2" onClick={reload}>
                تلاش دوباره
              </Button>
            </Alert>
          </div>
        ) : null}
        {state.status === "ready" ? (
          <nav
            className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm"
            aria-label="صفحه‌بندی نیروگاه‌ها"
          >
            <Button
              variant="ghost"
              disabled={!state.data.previous}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              قبلی
            </Button>
            <span>
              صفحهٔ {faNumber(page)} · {faNumber(state.data.count)} نیروگاه · وضعیت:{" "}
              {status === "all" ? "همه" : plantStatusLabel(status)}
            </span>
            <Button variant="ghost" disabled={!state.data.next} onClick={() => setPage((value) => value + 1)}>
              بعدی
            </Button>
          </nav>
        ) : null}
      </AdminSolidSurface>

      {modal?.kind === "new" || modal?.kind === "edit" ? (
        <AdminPlantForm
          key={modal.kind === "edit" ? modal.plant.uuid : "new"}
          plant={modal.kind === "edit" ? modal.plant : undefined}
          onClose={(refresh) => {
            setModal(undefined);
            if (refresh) reload();
          }}
          onSaved={() => saved("نیروگاه ذخیره شد و در انتظار بررسی است.")}
        />
      ) : null}

      {modal?.kind === "delete" ? (
        <DeletePlant
          plant={modal.plant}
          onClose={(refresh) => {
            setModal(undefined);
            if (refresh) reload();
          }}
          onSaved={() => saved("نیروگاه از فهرست حذف شد.")}
        />
      ) : null}
    </AdminPage>
  );
}

function DeletePlant({
  plant,
  onClose,
  onSaved,
}: {
  readonly plant: AdminPlant;
  readonly onClose: (refresh?: boolean) => void;
  readonly onSaved: () => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);

  return (
    <ConfirmDialog
      open
      onClose={() => onClose(uncertain)}
      onConfirm={() => {
        if (inFlight.current || uncertain) return;
        inFlight.current = true;
        setPending(true);
        setError("");
        void deleteAdminPlant(plant.uuid)
          .then(onSaved)
          .catch((failure) => {
            setError(adminPlantError(failure));
            setUncertain(uncertainPlantMutation(failure));
          })
          .finally(() => {
            inFlight.current = false;
            setPending(false);
          });
      }}
      title="حذف نرم نیروگاه؟"
      description={`«${plant.name}» از فهرست جاری حذف می‌شود. مالک: ${plant.owner_phone || "نامشخص"}`}
      confirmLabel={uncertain ? "بستن و بررسی فهرست" : "تأیید حذف"}
      pending={pending}
      tone="danger"
    >
      <AdminAuditLine text={plant.lastAction} />
      {error ? <Alert tone="danger" className="mt-3" title={error} /> : null}
    </ConfirmDialog>
  );
}
