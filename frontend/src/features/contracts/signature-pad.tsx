"use client";

import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent, type ReactElement } from "react";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { isSignatureType, signatureMaxBytes } from "./contracts-api";

type Point = { readonly x: number; readonly y: number };
type Stroke = Point[];
type SignaturePadProps = { readonly onChange: (blob: Blob | null) => void; readonly disabled?: boolean };
const logicalWidth = 1000, logicalHeight = 400;

export function SignaturePad({ onChange, disabled = false }: SignaturePadProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef<Stroke | null>(null);
  const imageRef = useRef<ImageBitmap | null>(null);
  const operation = useRef(0);
  const [hasInk, setHasInk] = useState(false), [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function redraw(): void {
    const canvas = canvasRef.current; if (!canvas) return;
    const context = canvas.getContext("2d"); if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink-0").trim() || "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / logicalWidth, canvas.height / logicalHeight);
    context.setTransform(scale, 0, 0, scale, (canvas.width - logicalWidth * scale) / 2, (canvas.height - logicalHeight * scale) / 2);
    const image = imageRef.current;
    if (image) { const scale = Math.min(logicalWidth / image.width, logicalHeight / image.height); const width = image.width * scale, height = image.height * scale; context.drawImage(image, (logicalWidth - width) / 2, (logicalHeight - height) / 2, width, height); }
    context.strokeStyle = "#10243a"; context.lineWidth = 3; context.lineCap = "round"; context.lineJoin = "round";
    for (const stroke of strokes.current) { const first = stroke[0]; if (!first) continue; context.beginPath(); context.moveTo(first.x, first.y); for (const point of stroke.slice(1)) context.lineTo(point.x, point.y); context.stroke(); }
  }
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.max(1, Math.round(bounds.width * ratio)); canvas.height = Math.max(1, Math.round(bounds.height * ratio)); redraw();
    });
    observer.observe(canvas);
    return () => { observer.disconnect(); imageRef.current?.close(); operation.current += 1; };
  }, []);
  function position(event: PointerEvent<HTMLCanvasElement>): Point {
    const bounds = event.currentTarget.getBoundingClientRect();
    const scale = Math.min(bounds.width / logicalWidth, bounds.height / logicalHeight);
    const offsetX = (bounds.width - logicalWidth * scale) / 2, offsetY = (bounds.height - logicalHeight * scale) / 2;
    return { x: Math.max(0, Math.min(logicalWidth, (event.clientX - bounds.left - offsetX) / scale)), y: Math.max(0, Math.min(logicalHeight, (event.clientY - bounds.top - offsetY) / scale)) };
  }
  function start(event: PointerEvent<HTMLCanvasElement>): void {
    if (disabled || busy || !event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = [position(event)]; drawing.current = stroke; strokes.current.push(stroke); setError("");
  }
  function move(event: PointerEvent<HTMLCanvasElement>): void {
    if (!drawing.current || !event.isPrimary) return;
    drawing.current.push(position(event)); redraw();
  }
  function finish(event: PointerEvent<HTMLCanvasElement>): void {
    if (!drawing.current) return;
    drawing.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const meaningful = imageRef.current !== null || strokes.current.some((stroke) => stroke.length > 2 && stroke.some((point, index) => { const first = stroke[0]; return index > 0 && first && Math.hypot(point.x - first.x, point.y - first.y) > 8; }));
    setHasInk(meaningful);
    if (!meaningful) { onChange(null); return; }
    const current = ++operation.current;
    canvasRef.current?.toBlob((blob) => { if (current === operation.current) onChange(blob); }, "image/png");
  }
  function clear(): void {
    operation.current += 1; strokes.current = []; drawing.current = null; imageRef.current?.close(); imageRef.current = null;
    setHasInk(false); setError(""); if (fileRef.current) fileRef.current.value = ""; redraw(); onChange(null);
  }
  async function chooseImage(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]; if (!file) return;
    if (!isSignatureType(file.type) || file.size === 0 || file.size > signatureMaxBytes) { setError("تصویر PNG، JPEG یا WebP با حجم حداکثر ۱۵ مگابایت انتخاب کنید."); return; }
    const current = ++operation.current; setBusy(true); setError("");
    let image: ImageBitmap | undefined;
    try {
      image = await createImageBitmap(file);
      if (current !== operation.current) { image.close(); return; }
      const check = document.createElement("canvas"); check.width = 160; check.height = 64;
      const context = check.getContext("2d"); if (!context) throw new Error();
      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink-0").trim() || "#ffffff";
      context.fillRect(0, 0, 160, 64);
      context.drawImage(image, 0, 0, 160, 64);
      const pixels = context.getImageData(0, 0, 160, 64).data;
      let ink = 0;
      for (let index = 0; index < pixels.length; index += 4) if ((pixels[index] ?? 255) < 220 || (pixels[index + 1] ?? 255) < 220 || (pixels[index + 2] ?? 255) < 220) ink += 1;
      if (ink < 8) { image.close(); setError("تصویر انتخاب‌شده خالی است یا اثر امضا در آن دیده نمی‌شود."); return; }
      imageRef.current?.close(); imageRef.current = image; strokes.current = []; redraw(); setHasInk(true); onChange(file);
    } catch { image?.close(); if (current === operation.current) setError("تصویر قابل خواندن نیست. فایل دیگری انتخاب کنید."); }
    finally { if (current === operation.current) setBusy(false); }
  }
  return <div className="contract-signature-pad"><p id="signature-help">با قلم، لمس یا ماوس امضا کنید؛ یا تصویر امضای خود را انتخاب کنید. تغییر اندازهٔ صفحه، اثر امضا را نگه می‌دارد.</p><canvas role="img" ref={canvasRef} className="contract-signature-canvas" aria-label="ناحیهٔ ترسیم امضا؛ انتخاب فایل نیز در دسترس است" aria-describedby="signature-help" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} /><div className="contract-signature-controls"><Button variant="secondary" disabled={disabled || busy || !hasInk} onClick={clear}><Icon name="trash" className="size-4" />پاک‌کردن امضا و شروع مجدد</Button><label className="contract-image-upload">انتخاب تصویر امضا<input className="sr-only" ref={fileRef} type="file" aria-invalid={Boolean(error)} aria-describedby={error ? "signature-help signature-file-error" : "signature-help"} accept="image/png,image/jpeg,image/webp" disabled={disabled || busy} onChange={(event) => { void chooseImage(event); }} /></label></div><p className="contract-note" role="status">{busy ? "در حال بررسی تصویر…" : hasInk ? "تصویر امضا آماده است؛ هنوز به قراردادی متصل یا ارسال نشده است." : "ناحیهٔ امضا خالی است."}</p>{error ? <p id="signature-file-error" className="contract-field-error" role="alert">{error}</p> : null}</div>;
}
