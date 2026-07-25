"use client";

import { Button } from "@/shared/ui/Button";
import { X } from "@/shared/lib/icons";
import { useEffect, useMemo } from "react";

interface FilePreviewModalProps {
  open: boolean;
  title: string;
  mimeType: string;
  blob: Blob | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onDownload: () => void;
}

export function FilePreviewModal({
  open,
  title,
  mimeType,
  blob,
  loading,
  error,
  onClose,
  onDownload,
}: FilePreviewModalProps) {
  const objectUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isPdf = mimeType === "application/pdf" || title.toLowerCase().endsWith(".pdf");
  const isImage = mimeType.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">پیش‌نمایش فایل</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onDownload}>
              دانلود
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="بستن پیش‌نمایش"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-[320px] flex-1 bg-slate-50 p-4">
          {loading && (
            <div className="flex h-80 items-center justify-center text-sm text-slate-500">
              در حال آماده‌سازی پیش‌نمایش…
            </div>
          )}
          {!loading && error && (
            <div className="flex h-80 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <Button type="button" size="sm" onClick={onDownload}>
                دانلود فایل
              </Button>
            </div>
          )}
          {!loading && !error && objectUrl && isPdf && (
            <iframe title={title} src={objectUrl} className="h-[70vh] w-full rounded-xl border border-slate-200 bg-white" />
          )}
          {!loading && !error && objectUrl && isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={objectUrl}
              alt={title}
              className="mx-auto max-h-[70vh] rounded-xl object-contain"
            />
          )}
          {!loading && !error && objectUrl && !isPdf && !isImage && (
            <div className="flex h-80 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-slate-600">
                پیش‌نمایش این نوع فایل در مرورگر پشتیبانی نمی‌شود.
              </p>
              <Button type="button" size="sm" onClick={onDownload}>
                دانلود فایل
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
