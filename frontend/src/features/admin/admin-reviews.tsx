"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  ConfirmDialog,
  DataTable,
  Drawer,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type DataTableColumn,
} from "@/components/ui";
import { SignaturePreview } from "@/features/contracts";
import { plantError } from "@/features/plants";
import { faNumber } from "@/shared/lib/fa";
import { getAdminBranches } from "./admin-plants-api";
import { AdminAuditLine, AdminPage, AdminSolidSurface } from "./admin-page";
import {
  getReviewQueue,
  rejectReasonMinLength,
  submitReview,
  type ReviewItem,
  type ReviewKind,
  type ReviewPage,
} from "./reviews-api";

const labels: Record<ReviewKind, string> = {
  branches: "انشعاب‌ها",
  plants: "نیروگاه‌ها",
  contracts: "قراردادهای امضاشده",
};

type State =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: ReviewPage };

const REJECT_MIN = rejectReasonMinLength();

export function AdminReviews(): ReactElement {
  const [kind, setKind] = useState<ReviewKind>("branches");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ readonly key: string; readonly state: State }>();
  const [selected, setSelected] = useState<ReviewItem>();
  const [notice, setNotice] = useState("");
  const key = `${kind}:${page}:${debounced}:${attempt}`;
  const state: State = result?.key === key ? result.state : { status: "loading" };

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced, kind]);

  useEffect(() => {
    const controller = new AbortController();
    void getReviewQueue(kind, page, debounced, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: plantError(error) } });
        }
      });
    return () => controller.abort();
  }, [kind, page, debounced, key]);

  const columns: DataTableColumn<ReviewItem>[] = [
    {
      id: "title",
      header: "عنوان",
      mobilePrimary: true,
      cell: (row) => <span className="font-semibold">{row.title}</span>,
    },
    {
      id: "owner",
      header: "مالک / کاربر",
      cell: (row) =>
        row.ownerPhone ? (
          <bdi dir="ltr">{row.ownerPhone}</bdi>
        ) : (
          (row.fields.find(([label]) => label.includes("فروشنده") || label.includes("کاربر"))?.[1] ?? "—")
        ),
    },
    {
      id: "detail",
      header: "خلاصه",
      cell: (row) => <span className="line-clamp-1 text-foreground-muted">{row.fields[1]?.[1] || row.fields[0]?.[1] || "—"}</span>,
    },
    {
      id: "audit",
      header: "آخرین اقدام",
      cell: (row) => <AdminAuditLine text={row.lastAction} />,
    },
  ];

  return (
    <AdminPage
      title="صف بررسی"
      description="انشعاب، نیروگاه و قرارداد امضاشده را بررسی کنید. تأیید با یک کلیک و تأییدیه؛ رد فقط با دلیل قابل نمایش برای کاربر."
      headerAction={
        <Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
          تازه‌سازی
        </Button>
      }
    >
      <Tabs
        value={kind}
        onValueChange={(value) => {
          setKind(value as ReviewKind);
          setNotice("");
          setSelected(undefined);
        }}
        defaultValue="branches"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList aria-label="نوع صف بررسی">
            {(Object.keys(labels) as ReviewKind[]).map((entry) => (
              <TabsTrigger key={entry} value={entry}>
                {labels[entry]}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="w-full sm:max-w-xs">
            <Input
              label="جست‌وجو در صف"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جست‌وجو…"
            />
          </div>
        </div>

        {notice ? (
          <Alert tone="success" className="mt-3" title={notice} />
        ) : null}

        {(Object.keys(labels) as ReviewKind[]).map((entry) => (
          <TabsContent key={entry} value={entry} className="mt-3">
            {entry !== kind ? null : (
              <AdminSolidSurface className="overflow-hidden">
                <DataTable
                  columns={columns}
                  rows={state.status === "ready" ? state.data.results : []}
                  getRowId={(row) => row.uuid}
                  loading={state.status === "loading"}
                  emptyTitle="درخواستی در این صف نیست"
                  emptyDescription="صفحه را تازه‌سازی کنید یا عبارت جست‌وجو را تغییر دهید."
                  onRowClick={(row) => setSelected(row)}
                />
                {state.status === "error" ? (
                  <div className="p-4">
                    <Alert tone="danger" title={state.message}>
                      <Button variant="secondary" className="mt-2" onClick={() => setAttempt((value) => value + 1)}>
                        تلاش دوباره
                      </Button>
                    </Alert>
                  </div>
                ) : null}
                {state.status === "ready" ? (
                  <nav className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm" aria-label="صفحه‌بندی">
                    <Button
                      variant="ghost"
                      disabled={!state.data.previous}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                    >
                      قبلی
                    </Button>
                    <span>
                      صفحهٔ {faNumber(page)} · {faNumber(state.data.count)} مورد
                    </span>
                    <Button
                      variant="ghost"
                      disabled={!state.data.next}
                      onClick={() => setPage((value) => value + 1)}
                    >
                      بعدی
                    </Button>
                  </nav>
                ) : null}
              </AdminSolidSurface>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {selected ? (
        <ReviewDrawer
          key={`${kind}:${selected.uuid}`}
          kind={kind}
          item={selected}
          onClose={() => setSelected(undefined)}
          onSaved={(decision) => {
            setSelected(undefined);
            setNotice(decision === "approved" ? "درخواست تأیید شد." : "درخواست با ثبت دلیل رد شد.");
            setPage(1);
            setAttempt((value) => value + 1);
          }}
        />
      ) : null}
    </AdminPage>
  );
}

function ReviewDrawer({
  kind,
  item,
  onClose,
  onSaved,
}: {
  readonly kind: ReviewKind;
  readonly item: ReviewItem;
  readonly onClose: () => void;
  readonly onSaved: (decision: "approved" | "rejected") => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [branchStatus, setBranchStatus] = useState<"loading" | "active" | "blocked" | "unknown">(
    kind === "plants" ? "loading" : "active",
  );
  const canApprovePlant = kind !== "plants" || branchStatus === "active";
  const plantBlocked = kind === "plants" && branchStatus === "blocked";

  useEffect(() => {
    if (kind !== "plants" || !item.branchUuid) {
      setBranchStatus(kind === "plants" ? "unknown" : "active");
      return;
    }
    const controller = new AbortController();
    void getAdminBranches(1, "", item.ownerUuid, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        const branch = page.results.find((entry) => entry.uuid === item.branchUuid);
        if (!branch) {
          // Fallback: search by uuid fragment via search field
          return getAdminBranches(1, item.branchUuid ?? "", undefined, controller.signal).then((fallback) => {
            if (controller.signal.aborted) return;
            const found = fallback.results.find((entry) => entry.uuid === item.branchUuid);
            setBranchStatus(found?.status === "active" ? "active" : "blocked");
          });
        }
        setBranchStatus(branch.status === "active" ? "active" : "blocked");
      })
      .catch(() => {
        if (!controller.signal.aborted) setBranchStatus("unknown");
      });
    return () => controller.abort();
  }, [kind, item.branchUuid, item.ownerUuid]);

  async function decide(decision: "approved" | "rejected", note: string): Promise<void> {
    if (inFlight.current) return;
    if (decision === "rejected" && note.trim().length < REJECT_MIN) {
      setError(`دلیل رد باید حداقل ${faNumber(REJECT_MIN)} نویسه باشد و برای کاربر نمایش داده می‌شود.`);
      return;
    }
    if (decision === "approved" && kind === "plants" && !canApprovePlant) {
      setError("تا وقتی انشعاب متصل تأیید نشده، نیروگاه قابل تأیید نیست.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await submitReview(kind, item.uuid, decision, note.trim());
      onSaved(decision);
    } catch (failure) {
      setError(plantError(failure));
    } finally {
      inFlight.current = false;
      setPending(false);
      setApproveOpen(false);
      setRejectOpen(false);
    }
  }

  return (
    <>
      <Drawer
        open
        onClose={() => {
          if (!pending) onClose();
        }}
        title={`بررسی ${item.title}`}
        description="جزئیات کامل را ببینید؛ سپس تأیید یا رد کنید."
        className="ms-auto max-w-lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" disabled={pending} onClick={onClose}>
              بستن
            </Button>
            <Button variant="danger" disabled={pending} onClick={() => setRejectOpen(true)}>
              رد با دلیل
            </Button>
            <span
              title={
                plantBlocked
                  ? "انشعاب این نیروگاه هنوز تأیید نشده؛ ابتدا انشعاب را تأیید کنید."
                  : branchStatus === "loading"
                    ? "در حال بررسی وضعیت انشعاب…"
                    : undefined
              }
            >
              <Button
                variant="primary"
                disabled={pending || plantBlocked || branchStatus === "loading"}
                onClick={() => setApproveOpen(true)}
              >
                تأیید
              </Button>
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          <AdminAuditLine text={item.lastAction} />
          {plantBlocked ? (
            <Alert
              tone="warning"
              title="تأیید نیروگاه فعلاً غیرفعال است"
            >
              انشعاب متصل هنوز تأیید نشده. ابتدا انشعاب را از تب «انشعاب‌ها» تأیید کنید.
            </Alert>
          ) : null}
          <dl className="grid gap-3">
            {item.fields.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-border pb-2 last:border-0">
                <dt className="text-caption text-foreground-muted">{label}</dt>
                <dd className="text-sm" dir="auto">
                  {value || "ثبت نشده"}
                </dd>
              </div>
            ))}
          </dl>
          {item.signature ? <SignaturePreview uuid={item.signature} /> : null}
          {error ? <Alert tone="danger" title={error} /> : null}
        </div>
      </Drawer>

      <ConfirmDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={() => {
          void decide("approved", "");
        }}
        title="تأیید این درخواست؟"
        description={`«${item.title}» تأیید می‌شود و وضعیت برای کاربر به‌روز می‌گردد.`}
        confirmLabel="تأیید نهایی"
        pending={pending}
        tone="primary"
      />

      <ConfirmDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={() => {
          void decide("rejected", reason);
        }}
        title="رد درخواست"
        description={`دلیل رد برای کاربر نمایش داده می‌شود (حداقل ${faNumber(REJECT_MIN)} نویسه).`}
        confirmLabel="ثبت رد"
        pending={pending}
        confirmDisabled={reason.trim().length < REJECT_MIN}
        tone="danger"
      >
        <Textarea
          label="دلیل رد"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          maxLength={1000}
          required
          error={
            reason.trim().length > 0 && reason.trim().length < REJECT_MIN
              ? `حداقل ${faNumber(REJECT_MIN)} نویسه لازم است`
              : undefined
          }
          helperText={`${faNumber(reason.trim().length)} نویسه · حداقل ${faNumber(REJECT_MIN)}`}
        />
      </ConfirmDialog>
    </>
  );
}
