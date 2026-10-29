"use client";

import { useEffect, useState, type ReactElement } from "react";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { getSignatureContent, contractError } from "./contracts-api";

type Preview = { readonly status: "idle" } | { readonly status: "loading" } | { readonly status: "ready"; readonly url: string } | { readonly status: "error"; readonly message: string };
export function SignaturePreview({ uuid }: { readonly uuid: string }): ReactElement {
  const [attempt, setAttempt] = useState(0);
  const [preview, setPreview] = useState<Preview>({ status: "idle" });
  useEffect(() => {
    if (!attempt) return;
    const controller = new AbortController(); let objectUrl: string | undefined;
    void getSignatureContent(uuid, controller.signal).then((blob) => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob); setPreview({ status: "ready", url: objectUrl });
    }).catch((error: unknown) => { if (!controller.signal.aborted) setPreview({ status: "error", message: contractError(error) }); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [uuid, attempt]);
  return <div className="contract-signature-preview"><p className="contract-note">این تصویر فقط مدرک امضای ثبت‌شده است؛ فایل PDF یا متن قرارداد نیست.</p>{preview.status === "ready" ? <>{/* Private bytes are fetched with Authorization, then shown from a revocable local URL. */}<Image unoptimized src={preview.url} width={600} height={240} alt="تصویر خصوصی امضای ثبت‌شدهٔ این قرارداد" /></> : <Button variant="secondary" disabled={preview.status === "loading"} onClick={() => { setPreview({ status: "loading" }); setAttempt((current) => current + 1); }}>{preview.status === "loading" ? "دریافت تصویر خصوصی…" : "مشاهدهٔ مدرک امضا"}</Button>}{preview.status === "error" ? <p role="alert">{preview.message}</p> : null}</div>;
}
