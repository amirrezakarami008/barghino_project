"use client";

import { cn } from "@/shared/lib/utils";
import { Eraser, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
  /** راهنمای داخل کادر */
  hint?: string;
}

/**
 * پد امضای لمسی/ماوس — خروجی PNG شفاف
 */
export function SignaturePad({
  value,
  onChange,
  className,
  hint = "اینجا با ماوس یا انگشت امضا کنید",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const current = useRef<{ x: number; y: number }[]>([]);
  const [hasInk, setHasInk] = useState(Boolean(value));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const ratio = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.2;
      redraw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes.current) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0]!.x, stroke[0]!.y);
      for (let i = 1; i < stroke.length; i += 1) {
        ctx.lineTo(stroke[i]!.x, stroke[i]!.y);
      }
      ctx.stroke();
    }
  }

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function emitChange() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const empty = strokes.current.length === 0;
    setHasInk(!empty);
    if (empty) {
      onChange(null);
      return;
    }
    onChange(canvas.toDataURL("image/png"));
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = [pointFromEvent(e)];
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const point = pointFromEvent(e);
    const prev = current.current[current.current.length - 1];
    current.current.push(point);
    if (prev) {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  }

  function onPointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    if (current.current.length > 1) {
      strokes.current.push(current.current);
    }
    current.current = [];
    emitChange();
  }

  function clear() {
    strokes.current = [];
    redraw();
    setHasInk(false);
    onChange(null);
  }

  function undo() {
    strokes.current.pop();
    redraw();
    emitChange();
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative h-48 overflow-hidden rounded-2xl border-2 border-dashed border-brand-300 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:16px_16px] shadow-inner sm:h-56">
        <div className="pointer-events-none absolute inset-x-8 bottom-10 border-b border-slate-300/80" />
        {!hasInk && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            {hint}
          </p>
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">
          امضا باید داخل کادر نقطه‌چین بالا باشد — همان‌جا در قرارداد نمایش داده می‌شود.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Undo2 className="h-3.5 w-3.5" />
            برگشت
          </button>
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            <Eraser className="h-3.5 w-3.5" />
            پاک کردن
          </button>
        </div>
      </div>
    </div>
  );
}
