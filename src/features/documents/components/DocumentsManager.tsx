"use client";

import { DashboardPage, EmptyState, Panel, PanelHeader, StatusBadge } from "@/features/dashboard/components";
import { DOCUMENTS } from "@/features/dashboard/constants";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import { useContracts } from "@/features/contracts/hooks/useContracts";
import { getContractById } from "@/features/contracts/lib/store";
import { resolveContractFileBlob } from "@/features/contracts/lib/resolveFile";
import { triggerDownload } from "@/features/contracts/lib/files";
import { FilePreviewModal } from "@/features/contracts/components/FilePreviewModal";
import { useUserDocuments } from "../hooks/useUserDocuments";
import {
  getUserDocumentById,
  removeUserDocument,
  resolveUserDocumentBlob,
} from "../lib/store";
import { DocumentUpload } from "./DocumentUpload";
import { useMemo, useState } from "react";
import type { ContractFile } from "@/features/contracts/types";
import type { UserDocument } from "../types";
import { Download, Eye, Trash2 } from "lucide-react";

const typeColors: Record<string, string> = {
  قرارداد: "bg-violet-50 text-violet-700",
  فاکتور: "bg-amber-50 text-amber-700",
  گواهی: "bg-emerald-50 text-emerald-700",
  مجوز: "bg-brand-50 text-brand-700",
  مدارک: "bg-sky-50 text-sky-700",
  "کارت ملی": "bg-sky-50 text-sky-700",
  شناسنامه: "bg-sky-50 text-sky-700",
  اساسنامه: "bg-indigo-50 text-indigo-700",
  "روزنامه رسمی": "bg-indigo-50 text-indigo-700",
  سایر: "bg-slate-100 text-slate-700",
};

type DocFilter = "all" | "مدارک" | "قرارداد" | "فاکتور" | "گواهی" | "مجوز";

type ListedDoc = {
  id: string;
  title: string;
  typeLabel: string;
  date: string;
  size: string;
  mimeType: string;
  source: "user" | "contract" | "static";
  contractId?: string;
  fileId?: string;
  userDocId?: string;
};

export function DocumentsManager() {
  const { contracts } = useContracts();
  const { documents: userDocuments } = useUserDocuments();
  const [filter, setFilter] = useState<DocFilter>("all");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<{
    title: string;
    mimeType: string;
    blob: Blob | null;
    loading: boolean;
    error: string | null;
    onDownload: () => void;
  } | null>(null);

  const allDocs = useMemo(() => {
    const fromUser: ListedDoc[] = userDocuments.map((doc) => ({
      id: `user-${doc.id}`,
      title: doc.title,
      typeLabel: doc.category,
      date: doc.uploadedAt,
      size: doc.size,
      mimeType: doc.mimeType,
      source: "user" as const,
      userDocId: doc.id,
    }));

    const fromContracts: ListedDoc[] = contracts.flatMap((contract) =>
      contract.files.map((file) => ({
        id: `${contract.id}-${file.id}`,
        title: `${file.name.replace(/\.pdf$/i, "")} — ${contract.billAccount}`,
        typeLabel: "قرارداد",
        date: file.uploadedAt,
        size: file.size,
        mimeType: file.mimeType,
        source: "contract" as const,
        contractId: contract.id,
        fileId: file.id,
      })),
    );

    const fromStatic: ListedDoc[] = DOCUMENTS.filter((doc) => doc.type !== "قرارداد").map((doc) => ({
      id: doc.id,
      title: doc.title,
      typeLabel: doc.type,
      date: doc.date,
      size: doc.size,
      mimeType: "application/pdf",
      source: "static" as const,
    }));

    return [...fromUser, ...fromContracts, ...fromStatic].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [userDocuments, contracts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDocs.filter((doc) => {
      if (filter === "مدارک" && doc.source !== "user") return false;
      if (filter === "قرارداد" && doc.typeLabel !== "قرارداد") return false;
      if (filter === "فاکتور" && doc.typeLabel !== "فاکتور") return false;
      if (filter === "گواهی" && doc.typeLabel !== "گواهی") return false;
      if (filter === "مجوز" && doc.typeLabel !== "مجوز") return false;
      if (!q) return true;
      return doc.title.toLowerCase().includes(q) || doc.typeLabel.includes(q);
    });
  }, [allDocs, filter, query]);

  const downloadStatic = (title: string) => {
    const blob = new Blob(
      [`Barghma document demo\n${title}\nThis is a placeholder file for non-contract documents.`],
      { type: "text/plain;charset=utf-8" },
    );
    triggerDownload(blob, `${title}.txt`);
  };

  const downloadContractDoc = async (contractId: string, fileId: string, name: string) => {
    const contract = getContractById(contractId);
    const file = contract?.files.find((f) => f.id === fileId);
    if (!contract || !file) {
      window.alert("فایل یافت نشد.");
      return;
    }
    const blob = await resolveContractFileBlob(contract, file);
    if (!blob) {
      window.alert("فایل در دسترس نیست.");
      return;
    }
    triggerDownload(blob, name || file.name);
  };

  const downloadUserDoc = async (doc: UserDocument) => {
    const blob = await resolveUserDocumentBlob(doc);
    if (!blob) {
      window.alert("فایل در دسترس نیست.");
      return;
    }
    triggerDownload(blob, doc.fileName);
  };

  const openPreview = async (doc: ListedDoc) => {
    if (doc.source === "static") {
      const blob = new Blob([`Barghma document demo\n${doc.title}`], {
        type: "text/plain;charset=utf-8",
      });
      setPreview({
        title: doc.title,
        mimeType: "text/plain",
        blob,
        loading: false,
        error: null,
        onDownload: () => downloadStatic(doc.title),
      });
      return;
    }

    if (doc.source === "user" && doc.userDocId) {
      setPreview({
        title: doc.title,
        mimeType: doc.mimeType,
        blob: null,
        loading: true,
        error: null,
        onDownload: () => undefined,
      });
      const userDoc = getUserDocumentById(doc.userDocId);
      if (!userDoc) {
        setPreview({
          title: doc.title,
          mimeType: doc.mimeType,
          blob: null,
          loading: false,
          error: "فایل یافت نشد.",
          onDownload: () => undefined,
        });
        return;
      }
      const blob = await resolveUserDocumentBlob(userDoc);
      setPreview({
        title: userDoc.fileName,
        mimeType: userDoc.mimeType,
        blob,
        loading: false,
        error: blob ? null : "پیش‌نمایش در دسترس نیست.",
        onDownload: () => void downloadUserDoc(userDoc),
      });
      return;
    }

    setPreview({
      title: doc.title,
      mimeType: doc.mimeType,
      blob: null,
      loading: true,
      error: null,
      onDownload: () => {
        if (doc.contractId && doc.fileId) {
          void downloadContractDoc(doc.contractId, doc.fileId, doc.title);
        }
      },
    });

    const contract = getContractById(doc.contractId!);
    const file = contract?.files.find((f) => f.id === doc.fileId) as ContractFile | undefined;
    if (!contract || !file) {
      setPreview({
        title: doc.title,
        mimeType: doc.mimeType,
        blob: null,
        loading: false,
        error: "فایل یافت نشد.",
        onDownload: () => undefined,
      });
      return;
    }

    const blob = await resolveContractFileBlob(contract, file);
    setPreview({
      title: file.name,
      mimeType: file.mimeType,
      blob,
      loading: false,
      error: blob ? null : "پیش‌نمایش در دسترس نیست.",
      onDownload: () => void downloadContractDoc(contract.id, file.id, file.name),
    });
  };

  return (
    <DashboardPage title="اسناد و مدارک" subtitle="بارگذاری مدارک، قراردادها و گواهی‌های رسمی">
      <Panel className="mb-6">
        <PanelHeader
          title="بارگذاری مدارک"
          description="کارت ملی، شناسنامه، اساسنامه و سایر مدارک مورد نیاز سامانه"
        />
        <DocumentUpload />
      </Panel>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "مدارک", "قرارداد", "فاکتور", "گواهی", "مجوز"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                filter === item
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {item === "all" ? "همه" : item}
              {item === "مدارک" && userDocuments.length > 0 ? ` (${userDocuments.length})` : ""}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جستجوی سند…"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-brand-400 placeholder:text-slate-400 focus:ring-2 sm:w-64"
        />
      </div>

      <Panel>
        <PanelHeader title="فایل‌های ذخیره‌شده" description={`${filtered.length} سند`} />
        {filtered.length === 0 ? (
          <EmptyState
            title="سندی یافت نشد"
            description="مدرک جدید بارگذاری کنید یا فیلتر را تغییر دهید."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-600">
                    {doc.mimeType.startsWith("image/") ? "IMG" : "PDF"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-slate-900">{doc.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          typeColors[doc.typeLabel] ?? "bg-slate-100 text-slate-700",
                        )}
                      >
                        {doc.typeLabel}
                      </span>
                      {doc.source === "user" && <StatusBadge status="info" label="آپلود کاربر" />}
                      <span className="text-xs text-slate-500">{doc.date}</span>
                      <span className="text-xs text-slate-400">{doc.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                  <button
                    type="button"
                    title="مشاهده"
                    aria-label="مشاهده"
                    onClick={() => void openPreview(doc)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="دانلود"
                    aria-label="دانلود"
                    onClick={() => {
                      if (doc.source === "contract" && doc.contractId && doc.fileId) {
                        void downloadContractDoc(doc.contractId, doc.fileId, doc.title);
                      } else if (doc.source === "user" && doc.userDocId) {
                        const userDoc = getUserDocumentById(doc.userDocId);
                        if (userDoc) void downloadUserDoc(userDoc);
                      } else {
                        downloadStatic(doc.title);
                      }
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {doc.source === "user" && doc.userDocId && (
                    <button
                      type="button"
                      title="حذف"
                      aria-label="حذف"
                      onClick={() => {
                        if (!window.confirm(`مدرک «${doc.title}» حذف شود؟`)) return;
                        void removeUserDocument(doc.userDocId!);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {doc.contractId && (
                    <Button href={`/dashboard/contracts/${doc.contractId}`} variant="ghost" size="sm">
                      قرارداد
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <FilePreviewModal
        open={Boolean(preview)}
        title={preview?.title ?? ""}
        mimeType={preview?.mimeType ?? ""}
        blob={preview?.blob ?? null}
        loading={preview?.loading}
        error={preview?.error}
        onClose={() => setPreview(null)}
        onDownload={() => preview?.onDownload()}
      />
    </DashboardPage>
  );
}
