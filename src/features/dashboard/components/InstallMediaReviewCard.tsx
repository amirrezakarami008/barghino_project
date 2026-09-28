"use client";

import { Panel, StatusBadge } from "@/features/dashboard/components";
import { DASHBOARD_USER } from "@/features/dashboard/constants";
import {
  ACCEPTED_INSTALL_MEDIA,
  MAX_INSTALL_MEDIA_BYTES,
  MAX_INSTALL_MEDIA_FILES,
  addInstallMedia,
  approveInstallMediaReview,
  formatFileSize,
  rejectInstallMediaReview,
  removeInstallMedia,
  submitInstallMediaForReview,
} from "@/features/dashboard/lib/installStore";
import { getFileBlob } from "@/features/contracts/lib/files";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { InstallMediaAttachment, InstallRequest } from "@/shared/types/dashboard";
import { Camera, Film, ImageIcon, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface InstallMediaReviewCardProps {
  request: InstallRequest;
  /** حالت فشرده برای پنل ادمین */
  adminMode?: boolean;
}

export function InstallMediaReviewCard({
  request,
  adminMode = false,
}: InstallMediaReviewCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const canUpload =
    request.currentStep === "submitted" || request.mediaReviewStatus === "rejected";
  const isPending = request.mediaReviewStatus === "pending";
  const isRejected = request.mediaReviewStatus === "rejected";
  const isApproved = request.mediaReviewStatus === "approved";
  const media = request.media ?? [];

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await addInstallMedia(request.id, file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری ناموفق بود.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (mediaId: string) => {
    setError(null);
    setBusy(true);
    try {
      await removeInstallMedia(request.id, mediaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف فایل ممکن نشد.");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitReview = () => {
    setError(null);
    setBusy(true);
    try {
      submitInstallMediaForReview(request.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال برای بررسی ممکن نشد.");
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = (by: "admin" | "ai") => {
    setError(null);
    setBusy(true);
    try {
      approveInstallMediaReview(request.id, { by });
    } catch (err) {
      setError(err instanceof Error ? err.message : "تأیید ممکن نشد.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = () => {
    setError(null);
    setBusy(true);
    try {
      rejectInstallMediaReview(request.id, rejectReason || undefined);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "رد درخواست ممکن نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      className={cn(
        isPending && "border-amber-200 bg-gradient-to-br from-amber-50/80 to-white",
        isRejected && "border-rose-200 bg-gradient-to-br from-rose-50/70 to-white",
        isApproved && "border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Camera className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-slate-900">
              بررسی اولیه با عکس / ویدیو
            </h3>
            {isPending && <StatusBadge status="processing" label="در انتظار تأیید" />}
            {isRejected && <StatusBadge status="pending" label="رد شده — ارسال مجدد" />}
            {isApproved && <StatusBadge status="success" label="تأیید شده" />}
            {!isPending && !isRejected && !isApproved && (
              <StatusBadge status="pending" label="نیاز به ارسال مدرک" />
            )}
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {canUpload
              ? "یک یا چند عکس/ویدیو واضح از پشت‌بام و فضای نصب بفرستید تا بررسی اولیه انجام شود. ادامه مسیر فقط پس از تأیید ادمین (و در آینده AI) ممکن است."
              : isPending
                ? "مدارک شما دریافت شد و در صف بررسی اولیه است. پس از تأیید، مرحله بازدید فعال می‌شود."
                : "بررسی اولیه تأیید شده و مسیر ادامه یافته است."}
          </p>

          {isRejected && request.mediaReviewNote && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              دلیل رد: {request.mediaReviewNote}
            </div>
          )}

          {media.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <MediaThumb
                  key={item.id}
                  item={item}
                  canRemove={canUpload && !busy}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </div>
          )}

          {canUpload && (
            <div className="mt-4 space-y-3">
              <button
                type="button"
                disabled={busy || media.length >= MAX_INSTALL_MEDIA_FILES}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 transition",
                  "border-slate-200 bg-slate-50/80 text-slate-600 hover:border-brand-300 hover:bg-brand-50/40",
                  (busy || media.length >= MAX_INSTALL_MEDIA_FILES) && "opacity-60",
                )}
              >
                <Upload className="h-6 w-6 text-brand-600" />
                <span className="text-sm font-semibold text-slate-800">
                  انتخاب عکس یا ویدیو
                </span>
                <span className="text-[11px] text-slate-400">
                  حداکثر {MAX_INSTALL_MEDIA_FILES} فایل · تا{" "}
                  {formatFileSize(MAX_INSTALL_MEDIA_BYTES)}
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_INSTALL_MEDIA}
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                size="lg"
                disabled={busy || media.length === 0}
                onClick={handleSubmitReview}
              >
                {busy ? "…" : "ارسال برای بررسی اولیه"}
              </Button>
            </div>
          )}

          {isPending && (adminMode || DASHBOARD_USER.isAdmin) && (
            <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
              <p className="text-xs font-semibold text-slate-700">
                پنل تأیید ادمین
                <span className="ms-2 font-normal text-slate-400">
                  (جایگزین آینده: بررسی خودکار با AI)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button disabled={busy} onClick={() => handleApprove("admin")}>
                  تأیید و ادامه به بازدید
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => handleApprove("ai")}
                >
                  شبیه‌سازی تأیید AI
                </Button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="دلیل رد (اختیاری)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
                <Button variant="ghost" disabled={busy} onClick={handleReject}>
                  رد مدارک
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function MediaThumb({
  item,
  canRemove,
  onRemove,
}: {
  item: InstallMediaAttachment;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    getFileBlob(item.storageKey).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item.storageKey]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="relative aspect-video bg-slate-100">
        {url && item.kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={item.fileName} className="h-full w-full object-cover" />
        )}
        {url && item.kind === "video" && (
          <video src={url} controls className="h-full w-full object-cover" />
        )}
        {!url && (
          <div className="flex h-full items-center justify-center text-slate-400">
            {item.kind === "video" ? (
              <Film className="h-8 w-8" />
            ) : (
              <ImageIcon className="h-8 w-8" />
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-700">{item.fileName}</p>
          <p className="text-[10px] text-slate-400">
            {item.kind === "video" ? "ویدیو" : "عکس"} · {formatFileSize(item.sizeBytes)}
          </p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
