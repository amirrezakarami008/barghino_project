"use client";

import { Panel, PanelHeader, StatusBadge } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { CONTRACT_FILE_KIND_LABELS } from "../constants";
import type { Contract, ContractFile } from "../types";
import { resolveContractFileBlob } from "../lib/resolveFile";
import { triggerDownload } from "../lib/files";
import { removeContractFile, uploadContractFile } from "../lib/store";
import { ContractUpload } from "./ContractUpload";
import { FilePreviewModal } from "./FilePreviewModal";
import { useState } from "react";

interface ContractFilesPanelProps {
  contract: Contract;
}

export function ContractFilesPanel({ contract }: ContractFilesPanelProps) {
  const [preview, setPreview] = useState<{
    file: ContractFile;
    blob: Blob | null;
    loading: boolean;
    error: string | null;
  } | null>(null);

  const downloadFile = async (file: ContractFile) => {
    const blob = await resolveContractFileBlob(contract, file);
    if (!blob) {
      window.alert("فایل در دسترس نیست.");
      return;
    }
    triggerDownload(blob, file.name);
  };

  const openPreview = async (file: ContractFile) => {
    setPreview({ file, blob: null, loading: true, error: null });
    try {
      const blob = await resolveContractFileBlob(contract, file);
      if (!blob) {
        setPreview({ file, blob: null, loading: false, error: "فایل برای پیش‌نمایش یافت نشد." });
        return;
      }
      setPreview({ file, blob, loading: false, error: null });
    } catch {
      setPreview({ file, blob: null, loading: false, error: "خطا در آماده‌سازی پیش‌نمایش." });
    }
  };

  return (
    <>
      <Panel>
        <PanelHeader
          title="فایل‌ها و پیوست‌ها"
          description={`${contract.files.length} فایل`}
        />

        {contract.files.length === 0 ? (
          <p className="mb-4 text-sm text-slate-500">هنوز فایلی برای این قرارداد ثبت نشده است.</p>
        ) : (
          <div className="mb-6 space-y-3">
            {contract.files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-slate-900">{file.name}</p>
                    <StatusBadge
                      status="info"
                      label={CONTRACT_FILE_KIND_LABELS[file.kind]}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    نسخه {file.version} · {file.size} · {file.uploadedAt} ·{" "}
                    {file.uploadedBy === "user" ? "کاربر" : "سامانه"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => void openPreview(file)}>
                    مشاهده
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void downloadFile(file)}>
                    دانلود
                  </Button>
                  {file.uploadedBy === "user" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!window.confirm(`فایل «${file.name}» حذف شود؟`)) return;
                        void removeContractFile(contract.id, file.id).catch((err) => {
                          window.alert(err instanceof Error ? err.message : "حذف ناموفق بود.");
                        });
                      }}
                    >
                      حذف
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <PanelHeader title="بارگذاری فایل" description="نسخه امضاشده، پیوست یا الحاقیه" />
        <ContractUpload
          onUpload={async (file, kind) => {
            await uploadContractFile(contract.id, file, kind);
          }}
        />
      </Panel>

      <FilePreviewModal
        open={Boolean(preview)}
        title={preview?.file.name ?? ""}
        mimeType={preview?.file.mimeType ?? ""}
        blob={preview?.blob ?? null}
        loading={preview?.loading}
        error={preview?.error}
        onClose={() => setPreview(null)}
        onDownload={() => {
          if (preview?.file) void downloadFile(preview.file);
        }}
      />
    </>
  );
}
