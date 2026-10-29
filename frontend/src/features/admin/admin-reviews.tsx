"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactElement } from "react";
import { SignaturePreview } from "@/features/contracts";
import { plantError } from "@/features/plants";
import { Icon } from "@/shared/ui/icon";
import { LoadingCards } from "@/shared/ui/loading-cards";
import { AdminPage } from "./admin-page";
import { getReviewQueue, submitReview, type ReviewItem, type ReviewKind, type ReviewPage } from "./reviews-api";
import "./admin-reviews.css";

const labels: Record<ReviewKind, string> = { branches: "انشعاب‌ها", plants: "نیروگاه‌ها", contracts: "قراردادها" };
type State = { readonly status: "loading" } | { readonly status: "error"; readonly message: string } | { readonly status: "ready"; readonly data: ReviewPage };
export function AdminReviews(): ReactElement {
  const [kind, setKind] = useState<ReviewKind>("branches"), [page, setPage] = useState(1), [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ readonly key: string; readonly state: State }>();
  const [selected, setSelected] = useState<ReviewItem>(), [notice, setNotice] = useState("");
  const key = `${kind}:${page}:${attempt}`;
  const state: State = result?.key === key ? result.state : { status: "loading" };
  useEffect(() => {
    const controller = new AbortController();
    void getReviewQueue(kind, page, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ key, state: { status: "ready", data } });
    }).catch((error: unknown) => { if (!controller.signal.aborted) setResult({ key, state: { status: "error", message: plantError(error) } }); });
    return () => controller.abort();
  }, [kind, page, key]);
  function reload(): void { setAttempt((value) => value + 1); }
  return <AdminPage title="بررسی درخواست‌ها" description="ابتدا انشعاب، سپس نیروگاه و در پایان قرارداد امضاشده را بررسی کنید." eyebrow={<><Icon name="shield" />بررسی شرکت</>} headerAction={<button type="button" className="admin-button admin-button-secondary" disabled={Boolean(selected)} onClick={reload}>تازه‌سازی صف</button>}>
    <div className="admin-review-tabs" role="group" aria-label="نوع درخواست">{(Object.keys(labels) as ReviewKind[]).map((entry) => <button key={entry} type="button" aria-pressed={kind === entry} onClick={() => { setKind(entry); setPage(1); setNotice(""); }}>{labels[entry]}</button>)}</div>
    <p className="admin-review-guide">فقط درخواست‌های در انتظار بررسی نمایش داده می‌شوند. تأیید نیروگاه نیازمند تأیید انشعاب متصل است؛ رد هر درخواست به دلیل روشن نیاز دارد.</p>
    {notice ? <p className="admin-review-notice" role="status">{notice}</p> : null}
    {state.status === "loading" ? <LoadingCards label="دریافت صف بررسی…" /> : state.status === "error" ? <div className="admin-review-error" role="alert"><p>{state.message}</p><button className="admin-button admin-button-secondary" type="button" onClick={reload}>تلاش دوباره</button></div> : <>
      {!state.data.results.length ? <div className="admin-empty-state"><Icon name="check" /><h2>درخواستی در این صفحه منتظر بررسی نیست</h2><button className="admin-button admin-button-secondary" type="button" onClick={reload}>تازه‌سازی صف</button></div> : <div className="admin-review-grid">{state.data.results.map((item) => <article key={item.uuid} className="admin-review-item"><header><span className="admin-icon-tile admin-tone-blue"><Icon name={kind === "branches" ? "home" : kind === "plants" ? "solarPanel" : "file"} /></span><h2>{item.title}</h2></header><dl>{item.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd dir="auto">{value || "ثبت نشده"}</dd></div>)}</dl>{item.signature ? <SignaturePreview uuid={item.signature} /> : null}<button type="button" className="admin-button admin-button-primary" onClick={() => setSelected(item)}>بررسی {item.title}</button></article>)}</div>}
      <nav className="admin-review-pagination" aria-label="صفحه‌بندی درخواست‌ها"><button type="button" className="admin-button admin-button-secondary" disabled={!state.data.previous} onClick={() => setPage((value) => Math.max(1, value - 1))}>قبلی</button><span>صفحهٔ {page.toLocaleString("fa-IR")} / {state.data.count.toLocaleString("fa-IR")} درخواست</span><button type="button" className="admin-button admin-button-secondary" disabled={!state.data.next} onClick={() => setPage((value) => value + 1)}>بعدی</button></nav>
    </>}
    {selected ? <ReviewDialog key={`${kind}:${selected.uuid}`} kind={kind} item={selected} onClose={() => setSelected(undefined)} onSaved={(decision) => { setSelected(undefined); setNotice(decision === "approved" ? "درخواست تأیید شد." : "درخواست با ثبت دلیل رد شد."); setPage(1); reload(); }} /> : null}
  </AdminPage>;
}
export function ReviewDialog({ kind, item, onClose, onSaved }: { readonly kind: ReviewKind; readonly item: ReviewItem; readonly onClose: () => void; readonly onSaved: (decision: "approved" | "rejected") => void }): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null), inFlight = useRef(false);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved"), [reason, setReason] = useState("");
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current, previous = document.activeElement, overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); if (inFlight.current || (decision === "rejected" && !reason.trim())) return;
    inFlight.current = true; setPending(true); setError("");
    try { await submitReview(kind, item.uuid, decision, reason.trim()); onSaved(decision); }
    catch (failure) { setError(plantError(failure)); }
    finally { inFlight.current = false; setPending(false); }
  }
  return <dialog ref={dialog} className="admin-review-dialog" aria-labelledby="review-dialog-title" onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}><form onSubmit={(event) => { void submit(event); }}><h2 id="review-dialog-title">بررسی {item.title}</h2><p>تصمیم شما ثبت می‌شود و کاربر نتیجه را در پنل خود می‌بیند.</p><fieldset disabled={pending}><legend>نتیجهٔ بررسی</legend><label><input type="radio" name="review-decision" checked={decision === "approved"} onChange={() => setDecision("approved")} />تأیید</label><label><input type="radio" name="review-decision" checked={decision === "rejected"} onChange={() => setDecision("rejected")} />رد درخواست</label><label htmlFor="review-reason">{decision === "rejected" ? "دلیل رد (الزامی)" : "یادداشت (اختیاری)"}</label><textarea id="review-reason" value={reason} onChange={(event) => setReason(event.target.value)} required={decision === "rejected"} maxLength={1000} rows={3} /></fieldset>{error ? <p role="alert" className="admin-review-error">{error}</p> : null}<footer><button type="submit" className="admin-button admin-button-primary" disabled={pending}>{pending ? "در حال ثبت…" : "ثبت تصمیم"}</button><button type="button" className="admin-button admin-button-secondary" disabled={pending} onClick={onClose}>انصراف</button></footer></form></dialog>;
}
