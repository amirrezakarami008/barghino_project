"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { ContractError } from "./contract-ui";
import { contractError, getContract, mutationMayHaveSucceeded, uploadSignature, type SignatureFile } from "./contracts-api";
import type { Contract } from "./contract-model";

const SignaturePad = dynamic(() => import("./signature-pad").then((module) => module.SignaturePad), {
  loading: () => <p role="status">در حال آماده‌سازی ابزار امضا…</p>,
});

type Evidence =
  | { readonly status: "empty" }
  | { readonly status: "ready"; readonly blob: Blob }
  | { readonly status: "uploading"; readonly blob: Blob }
  | { readonly status: "uploaded"; readonly blob: Blob; readonly file: SignatureFile }
  | { readonly status: "error"; readonly blob: Blob; readonly message: string; readonly uncertain: boolean };

export function ContractSignature({ contract, onServerChange }: { readonly contract: Contract; readonly onServerChange: (contract: Contract) => void }): ReactElement {
  const [opened, setOpened] = useState(false);
  const [evidence, setEvidence] = useState<Evidence>({ status: "empty" });
  const inFlight = useRef(false);
  const dirty = evidence.status === "ready" || evidence.status === "error" || evidence.status === "uploading";

  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault();
    }
    function guardClick(event: MouseEvent): void {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.origin !== location.origin ||
        link.pathname === location.pathname ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        link.target === "_blank"
      ) {
        return;
      }
      if (!window.confirm("تصویر امضا ذخیره نشده است. از این صفحه خارج می‌شوید؟")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", guardClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", guardClick, true);
    };
  }, [dirty]);

  async function saveEvidence(): Promise<void> {
    if (inFlight.current || (evidence.status !== "ready" && evidence.status !== "error") || (evidence.status === "error" && evidence.uncertain)) return;
    const blob = evidence.blob;
    inFlight.current = true;
    setEvidence({ status: "uploading", blob });
    try {
      const latest = await getContract(contract.uuid);
      if (latest.status !== "draft") {
        onServerChange(latest);
        return;
      }
      const file = await uploadSignature(blob);
      setEvidence({ status: "uploaded", blob, file });
    } catch (error) {
      setEvidence({ status: "error", blob, message: contractError(error), uncertain: mutationMayHaveSucceeded(error) });
    } finally {
      inFlight.current = false;
    }
  }

  const busy = evidence.status === "uploading";

  return (
    <section className="contract-signature-section" aria-labelledby="contract-sign-heading">
      <div className="contract-section-heading">
        <span>
          <Icon name="edit" />
        </span>
        <div>
          <h2 id="contract-sign-heading">بررسی شرایط و امضا</h2>
          <p>ثبت تصویر امضا با امضای قرارداد تفاوت دارد.</p>
        </div>
      </div>

      <div className="contract-document-blocker" role="note">
        <Icon name="lock" className="size-6 shrink-0" />
        <div>
          <h3>ارسال امضا در انتظار سند نهایی است</h3>
          <p>
            هنوز متن مرجع و نسخهٔ تأییدشدهٔ شرایط این قرارداد ارائه نشده است. خلاصهٔ مالی بالا جای سند نهایی را نمی‌گیرد. تا ارائهٔ سند، پذیرش شرایط و ارسال قرارداد به شرکت فعال نمی‌شود.
          </p>
        </div>
      </div>

      <div className="contract-signature-workspace">
        {!opened ? (
          <div className="contract-signature-invite">
            <p>در صورت تمایل می‌توانید تصویر امضا را برای استفاده‌های بعدی به‌صورت خصوصی ذخیره کنید. این کار قرارداد را امضا نمی‌کند.</p>
            <Button variant="secondary" onClick={() => setOpened(true)}>
              آماده‌سازی تصویر امضا (اختیاری)
            </Button>
          </div>
        ) : (
          <>
            <SignaturePad disabled={busy} onChange={(blob) => setEvidence(blob ? { status: "ready", blob } : { status: "empty" })} />
            <p className="contract-note">
              ذخیرهٔ تصویر، فقط یک فایل خصوصی در حساب شما ایجاد می‌کند؛ قرارداد را امضا نمی‌کند. تا زمان اتصال به قرارداد، تصویر ذخیره‌شده در همین صفحه نگه داشته می‌شود و با خروج از صفحه انتخاب آن از دست می‌رود.
            </p>
            {evidence.status === "error" ? (
              <ContractError
                message={
                  evidence.uncertain
                    ? "نتیجهٔ ذخیرهٔ فایل مشخص نیست. برای جلوگیری از فایل تکراری، دوباره ارسال نکنید؛ مدارک حساب یا پشتیبانی را بررسی کنید."
                    : evidence.message
                }
              />
            ) : null}
            <div className="contract-evidence-actions">
              <Button
                variant="secondary"
                disabled={evidence.status === "empty" || busy || evidence.status === "uploaded" || (evidence.status === "error" && evidence.uncertain)}
                onClick={() => {
                  void saveEvidence();
                }}
              >
                {busy ? "در حال ذخیرهٔ خصوصی…" : evidence.status === "uploaded" ? "تصویر خصوصی ذخیره شد" : "ذخیرهٔ خصوصی تصویر امضا"}
              </Button>
              {evidence.status === "uploaded" ? (
                <p role="status">
                  <Icon name="check" className="size-4" />
                  فایل ذخیره شد؛ این قرارداد همچنان پیش‌نویس است.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

      <div className="contract-sign-final">
        <label>
          <input type="checkbox" checked={false} disabled readOnly />
          پذیرش صریح شرایط پس از ارائهٔ سند نهایی فعال می‌شود.
        </label>
        <Button disabled aria-describedby="contract-sign-blocked">
          <Icon name="lock" className="size-4" />
          ثبت امضا و ارسال برای بررسی
        </Button>
        <p id="contract-sign-blocked">امضا ارسال نمی‌شود؛ منبع معتبر متن و نسخهٔ سند موجود نیست.</p>
        <Link href="/contact" className="contract-back">
          ارتباط با پشتیبانی قرارداد
        </Link>
      </div>
    </section>
  );
}
