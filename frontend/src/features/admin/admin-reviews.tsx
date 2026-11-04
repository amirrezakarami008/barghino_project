"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Alert,
  Button,
  ConfirmDialog,
  Drawer,
  EmptyState,
  Skeleton,
  StatusPill,
  Textarea,
} from "@/components/ui";
import { SignaturePreview } from "@/features/contracts";
import { plantError } from "@/features/plants";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";
import { AdminAuditLine } from "./admin-page";
import {
  getReviewQueue,
  processRenewal,
  rejectReasonMinLength,
  submitReview,
  type ReviewItem,
  type ReviewKind,
  type ReviewPage,
} from "./reviews-api";
import "./admin-workspace.css";

const labels: Record<ReviewKind, string> = {
  branches: "انشعاب‌ها",
  plants: "نیروگاه‌ها",
  contracts: "قراردادهای امضاشده",
  renewals: "درخواست‌های تمدید",
};

const kindMeta: Record<ReviewKind, { readonly label: string; readonly icon: IconName }> = {
  branches: { label: "انشعاب", icon: "home" },
  plants: { label: "نیروگاه", icon: "plant" },
  contracts: { label: "قرارداد", icon: "file" },
  renewals: { label: "تمدید", icon: "file" },
};

type State =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: ReviewPage };

type Modal =
  | { readonly kind: "detail"; readonly item: ReviewItem }
  | { readonly kind: "approve"; readonly item: ReviewItem }
  | { readonly kind: "reject"; readonly item: ReviewItem }
  | { readonly kind: "renew"; readonly item: ReviewItem };

const REJECT_MIN = rejectReasonMinLength();
const PREVIEW_FIELD_COUNT = 4;
const REVIEW_KINDS = Object.keys(labels) as ReviewKind[];

function parseTab(value: string | null): ReviewKind {
  if (value && REVIEW_KINDS.includes(value as ReviewKind)) return value as ReviewKind;
  return "branches";
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function AdminReviews(): ReactElement {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kind = parseTab(searchParams.get("tab"));
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ readonly key: string; readonly state: State }>();
  const [modal, setModal] = useState<Modal>();
  const [notice, setNotice] = useState("");
  const key = `${kind}:${page}:${attempt}`;
  const state: State = result?.key === key ? result.state : { status: "loading" };

  function selectKind(next: ReviewKind): void {
    setNotice("");
    setModal(undefined);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "branches") params.delete("tab");
    else params.set("tab", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    const controller = new AbortController();
    void getReviewQueue(kind, page, "", controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, state: { status: "error", message: plantError(error) } });
        }
      });
    return () => controller.abort();
  }, [kind, page, key]);

  function saved(decision: "approved" | "rejected" | "renewed"): void {
    setModal(undefined);
    setNotice(
      decision === "approved"
        ? "درخواست تأیید شد."
        : decision === "rejected"
          ? "درخواست با ثبت دلیل رد شد."
          : "تمدید قرارداد اعمال شد.",
    );
    setPage(1);
    setAttempt((value) => value + 1);
  }

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <>
      <motion.div className="admin-workspace" {...motionProps}>
        <motion.section className="admin-ws-hero" variants={reduceMotion ? undefined : fadeUp}>
          <div className="min-w-0">
            <p className="admin-ws-hero-eyebrow">تصمیم‌گیری</p>
            <h2 className="admin-ws-hero-title">صف بررسی درخواست‌ها</h2>
            <p className="admin-ws-hero-body">
              انشعاب، نیروگاه، قرارداد امضاشده و تمدید را ببینید و مستقیم تأیید یا رد کنید.
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
                تازه‌سازی
              </Button>
            </div>
          </div>
          <div className="admin-ws-hero-art">
            <PanelArt name="installs/success" width={260} height={260} className="admin-ws-hero-image" />
          </div>
        </motion.section>

        <motion.div className="admin-ws-toolbar" variants={reduceMotion ? undefined : fadeUp}>
          <div className="admin-ws-pills" role="tablist" aria-label="نوع صف بررسی">
            {REVIEW_KINDS.map((entry) => (
              <button
                key={entry}
                type="button"
                role="tab"
                aria-selected={kind === entry}
                className={cn(
                  "admin-ws-pill",
                  kind === entry ? "admin-ws-pill--active" : "admin-ws-pill--idle",
                )}
                onClick={() => selectKind(entry)}
              >
                {labels[entry]}
              </button>
            ))}
          </div>
        </motion.div>

        {notice ? <Alert tone="success" title={notice} /> : null}

        <ReviewQueuePanel
          kind={kind}
          state={state}
          page={page}
          onPageChange={setPage}
          onRetry={() => setAttempt((value) => value + 1)}
          onDetail={(item) => setModal({ kind: "detail", item })}
          onApprove={(item) => setModal({ kind: "approve", item })}
          onReject={(item) => setModal({ kind: "reject", item })}
          onRenew={(item) => setModal({ kind: "renew", item })}
        />
      </motion.div>

      {modal?.kind === "detail" ? (
        <ReviewDetailDrawer
          key={`${kind}:${modal.item.uuid}`}
          kind={kind}
          item={modal.item}
          onClose={() => setModal(undefined)}
          onApprove={() => setModal({ kind: "approve", item: modal.item })}
          onReject={() => setModal({ kind: "reject", item: modal.item })}
          onRenew={() => setModal({ kind: "renew", item: modal.item })}
        />
      ) : null}

      {modal?.kind === "approve" || modal?.kind === "reject" ? (
        <ReviewDecisionDialog
          key={`${modal.kind}:${modal.item.uuid}`}
          kind={kind as Exclude<ReviewKind, "renewals">}
          item={modal.item}
          decision={modal.kind === "approve" ? "approved" : "rejected"}
          onClose={() => setModal(undefined)}
          onSaved={saved}
        />
      ) : null}

      {modal?.kind === "renew" ? (
        <RenewalDecisionDialog
          key={`renew:${modal.item.uuid}`}
          item={modal.item}
          onClose={() => setModal(undefined)}
          onSaved={() => saved("renewed")}
        />
      ) : null}
    </>
  );
}

function ReviewQueuePanel({
  kind,
  state,
  page,
  onPageChange,
  onRetry,
  onDetail,
  onApprove,
  onReject,
  onRenew,
}: {
  readonly kind: ReviewKind;
  readonly state: State;
  readonly page: number;
  readonly onPageChange: (value: number | ((current: number) => number)) => void;
  readonly onRetry: () => void;
  readonly onDetail: (item: ReviewItem) => void;
  readonly onApprove: (item: ReviewItem) => void;
  readonly onReject: (item: ReviewItem) => void;
  readonly onRenew: (item: ReviewItem) => void;
}): ReactElement {
  if (state.status === "loading") {
    return (
      <div className="admin-ws-list" aria-busy="true" aria-label="در حال بارگذاری صف">
        <Skeleton className="h-44 rounded-[26px]" />
        <Skeleton className="h-44 rounded-[26px]" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Alert tone="danger" title={state.message}>
        <Button variant="secondary" className="mt-2" onClick={onRetry}>
          تلاش دوباره
        </Button>
      </Alert>
    );
  }

  if (state.data.results.length === 0) {
    return (
      <div className="admin-ws-empty">
        <PanelArt name="installs/empty" width={160} height={160} className="admin-ws-empty-art" />
        <EmptyState
          hideIcon
          className="border-0 bg-transparent p-0 shadow-none"
          title="درخواستی در این صف نیست"
          description="صف را تازه‌سازی کنید یا بخش دیگری را باز کنید."
          icon="shield"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="admin-ws-result">
        {faNumber(state.data.count)} مورد در صف {labels[kind]}
      </p>
      <ul className="admin-ws-list" aria-label={`کارت‌های ${labels[kind]}`}>
        {state.data.results.map((item) => (
          <li key={item.uuid} className="min-w-0">
            <ReviewCard
              kind={kind}
              item={item}
              onDetail={() => onDetail(item)}
              onApprove={() => onApprove(item)}
              onReject={() => onReject(item)}
              onRenew={() => onRenew(item)}
            />
          </li>
        ))}
      </ul>

      {(state.data.next || state.data.previous) ? (
        <nav className="admin-ws-pager" aria-label="صفحه‌بندی">
          <Button
            variant="ghost"
            disabled={!state.data.previous}
            onClick={() => onPageChange((value) => Math.max(1, value - 1))}
          >
            قبلی
          </Button>
          <span>صفحهٔ {faNumber(page)}</span>
          <Button variant="ghost" disabled={!state.data.next} onClick={() => onPageChange((value) => value + 1)}>
            بعدی
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

function ReviewCard({
  kind,
  item,
  onDetail,
  onApprove,
  onReject,
  onRenew,
}: {
  readonly kind: ReviewKind;
  readonly item: ReviewItem;
  readonly onDetail: () => void;
  readonly onApprove: () => void;
  readonly onReject: () => void;
  readonly onRenew: () => void;
}): ReactElement {
  const meta = kindMeta[kind];
  const previewFields = item.fields.slice(0, PREVIEW_FIELD_COUNT);
  const extraCount = Math.max(0, item.fields.length - previewFields.length);
  const isRenewals = kind === "renewals";

  return (
    <article className="admin-ws-card">
      <div className="admin-ws-card-top">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="admin-ws-chip inline-flex items-center gap-1.5">
              <Icon name={meta.icon} className="size-3.5" aria-hidden />
              {meta.label}
            </span>
            <StatusPill
              status="pending"
              label={isRenewals ? "در انتظار تمدید" : "در انتظار بررسی"}
            />
          </div>
          <h3 className="admin-ws-card-title">{item.title}</h3>
        </div>
      </div>

      <dl className="admin-ws-card-body grid gap-3">
        {previewFields.map(([label, value]) => (
          <div key={label} className="grid gap-0.5">
            <dt className="text-caption text-foreground-muted">{label}</dt>
            <dd className="text-sm leading-relaxed" dir="auto">
              {value || "ثبت نشده"}
            </dd>
          </div>
        ))}
      </dl>

      {item.signature ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface p-2 ms-2">
          <SignaturePreview uuid={item.signature} />
        </div>
      ) : null}

      {extraCount > 0 ? (
        <p className="admin-ws-card-hint ps-2">و {faNumber(extraCount)} مورد جزئیات بیشتر</p>
      ) : null}

      <div className="admin-ws-card-foot">
        <AdminAuditLine text={item.lastAction} />
        <div className="admin-ws-actions">
          <Button variant="ghost" size="sm" onClick={onDetail}>
            جزئیات
          </Button>
          {isRenewals ? (
            <Button variant="primary" size="sm" onClick={onRenew}>
              اعمال تمدید
            </Button>
          ) : (
            <>
              <Button variant="primary" size="sm" onClick={onApprove}>
                تأیید
              </Button>
              <Button variant="danger" size="sm" onClick={onReject}>
                رد
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function ReviewDetailDrawer({
  kind,
  item,
  onClose,
  onApprove,
  onReject,
  onRenew,
}: {
  readonly kind: ReviewKind;
  readonly item: ReviewItem;
  readonly onClose: () => void;
  readonly onApprove: () => void;
  readonly onReject: () => void;
  readonly onRenew: () => void;
}): ReactElement {
  const meta = kindMeta[kind];
  const isRenewals = kind === "renewals";

  return (
    <Drawer
      open
      onClose={onClose}
      title={`بررسی ${item.title}`}
      description={
        isRenewals
          ? `جزئیات درخواست تمدید ${meta.label} را ببینید؛ سپس تمدید را اعمال کنید.`
          : `جزئیات کامل ${meta.label} را ببینید؛ سپس تأیید یا رد کنید.`
      }
      className="ms-auto max-w-lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            بستن
          </Button>
          {isRenewals ? (
            <Button variant="primary" onClick={onRenew}>
              اعمال تمدید
            </Button>
          ) : (
            <>
              <Button variant="danger" onClick={onReject}>
                رد با دلیل
              </Button>
              <Button variant="primary" onClick={onApprove}>
                تأیید
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-caption text-foreground-muted">
            <Icon name={meta.icon} className="size-3.5" aria-hidden />
            {meta.label}
          </span>
          <StatusPill status="pending" label={isRenewals ? "در انتظار تمدید" : "در انتظار بررسی"} />
        </div>
        <AdminAuditLine text={item.lastAction} />
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
      </div>
    </Drawer>
  );
}

function ReviewDecisionDialog({
  kind,
  item,
  decision,
  onClose,
  onSaved,
}: {
  readonly kind: Exclude<ReviewKind, "renewals">;
  readonly item: ReviewItem;
  readonly decision: "approved" | "rejected";
  readonly onClose: () => void;
  readonly onSaved: (decision: "approved" | "rejected") => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const isReject = decision === "rejected";

  async function confirm(): Promise<void> {
    if (inFlight.current) return;
    if (isReject && reason.trim().length < REJECT_MIN) {
      setError(`دلیل رد باید حداقل ${faNumber(REJECT_MIN)} نویسه باشد و برای کاربر نمایش داده می‌شود.`);
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await submitReview(kind, item.uuid, decision, isReject ? reason.trim() : "");
      onSaved(decision);
    } catch (failure) {
      setError(plantError(failure));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <ConfirmDialog
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      onConfirm={() => {
        void confirm();
      }}
      title={isReject ? "رد درخواست" : "تأیید این درخواست؟"}
      description={
        isReject
          ? `دلیل رد برای کاربر نمایش داده می‌شود (حداقل ${faNumber(REJECT_MIN)} نویسه).`
          : `«${item.title}» تأیید می‌شود و وضعیت برای کاربر به‌روز می‌گردد.`
      }
      confirmLabel={isReject ? "ثبت رد" : "تأیید نهایی"}
      pending={pending}
      confirmDisabled={isReject && reason.trim().length < REJECT_MIN}
      tone={isReject ? "danger" : "primary"}
    >
      {isReject ? (
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
      ) : null}
      {error ? <Alert tone="danger" className="mt-3" title={error} /> : null}
    </ConfirmDialog>
  );
}

function RenewalDecisionDialog({
  item,
  onClose,
  onSaved,
}: {
  readonly item: ReviewItem;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}): ReactElement {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function confirm(): Promise<void> {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await processRenewal(item.uuid);
      onSaved();
    } catch (failure) {
      setError(plantError(failure));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <ConfirmDialog
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      onConfirm={() => {
        void confirm();
      }}
      title="اعمال تمدید قرارداد؟"
      description={`پایان قرارداد «${item.title}» یک سال تمدید می‌شود و درخواست تمدید بسته می‌گردد.`}
      confirmLabel="اعمال تمدید"
      pending={pending}
      tone="primary"
    >
      {error ? <Alert tone="danger" className="mt-3" title={error} /> : null}
    </ConfirmDialog>
  );
}
