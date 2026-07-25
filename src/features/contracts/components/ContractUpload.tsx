"use client";

import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { ACCEPTED_UPLOAD_ACCEPT, CONTRACT_FILE_KIND_LABELS, MAX_UPLOAD_BYTES } from "../constants";
import type { ContractFileKind } from "../types";
import { formatFileSize } from "../lib/format";
import { useRef, useState } from "react";

interface ContractUploadProps {
  onUpload: (file: File, kind: ContractFileKind) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const KIND_OPTIONS: ContractFileKind[] = ["signed", "attachment", "amendment"];

export function ContractUpload({ onUpload, disabled, className }: ContractUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<ContractFileKind>("attachment");
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
      await onUpload(file, kind);
      setSuccess(`«${file.name}» با موفقیت بارگذاری شد.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری ناموفق بود.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {KIND_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled || busy}
            onClick={() => setKind(option)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              kind === option
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {CONTRACT_FILE_KIND_LABELS[option]}
          </button>
        ))}
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
          (disabled || busy) && "opacity-60",
        )}
      >
        <p className="text-sm font-medium text-slate-800">فایل را اینجا رها کنید یا انتخاب کنید</p>
        <p className="mt-1 text-xs text-slate-500">
          PDF، تصویر یا Word — حداکثر {formatFileSize(MAX_UPLOAD_BYTES)}
        </p>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "در حال بارگذاری…" : "انتخاب فایل"}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_ACCEPT}
          className="hidden"
          disabled={disabled || busy}
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
    </div>
  );
}
