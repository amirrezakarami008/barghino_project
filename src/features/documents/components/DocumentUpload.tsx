"use client";

import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import {
  ACCEPTED_DOCUMENT_ACCEPT,
  DOCUMENT_CATEGORIES,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from "../constants";
import type { DocumentCategory } from "../types";
import { formatFileSize } from "@/features/contracts/lib/format";
import { uploadUserDocument } from "../lib/store";
import { useRef, useState } from "react";

interface DocumentUploadProps {
  className?: string;
}

export function DocumentUpload({ className }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<DocumentCategory>("کارت ملی");
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await uploadUserDocument(file, category, title || undefined);
      setSuccess(`مدرک «${file.name}» با موفقیت بارگذاری شد.`);
      setTitle("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری ناموفق بود.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">نوع مدرک</p>
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={busy}
              onClick={() => setCategory(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                category === item.id
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
              title={item.hint}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="doc-title" className="mb-1.5 block text-xs font-medium text-slate-500">
          عنوان (اختیاری)
        </label>
        <input
          id="doc-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="مثلاً کارت ملی مدیرعامل"
          disabled={busy}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-400 placeholder:text-slate-400 focus:ring-2"
        />
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
          dragOver ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50/70",
          busy && "opacity-60",
        )}
      >
        <p className="text-sm font-medium text-slate-800">مدرک را اینجا رها کنید یا انتخاب کنید</p>
        <p className="mt-1 text-xs text-slate-500">
          PDF، تصویر یا Word — حداکثر {formatFileSize(MAX_DOCUMENT_UPLOAD_BYTES)}
        </p>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "در حال بارگذاری…" : "انتخاب فایل"}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_DOCUMENT_ACCEPT}
          className="hidden"
          disabled={busy}
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
    </div>
  );
}
