"use client";

import {
  DashboardPage,
  EmptyState,
  Panel,
  PanelHeader,
  StatusBadge,
} from "@/features/dashboard/components";
import { Button, LinkArrow } from "@/shared/ui/Button";
import { useContract } from "../hooks/useContracts";
import { requestContractRenewal } from "../lib/store";
import { resolveContractFileBlob } from "../lib/resolveFile";
import { triggerDownload } from "../lib/files";
import { ContractFilesPanel } from "./ContractFilesPanel";

interface ContractDetailViewProps {
  contractId: string;
}

export function ContractDetailView({ contractId }: ContractDetailViewProps) {
  const { contract } = useContract(contractId);

  if (!contract) {
    return (
      <DashboardPage title="جزئیات قرارداد" subtitle="قرارداد یافت نشد">
        <EmptyState
          title="این قرارداد وجود ندارد"
          description="ممکن است حذف شده باشد یا شناسه نادرست باشد."
          action={
            <Button href="/dashboard/contracts" className="group">
              بازگشت به قراردادها
              <LinkArrow />
            </Button>
          }
        />
      </DashboardPage>
    );
  }

  const primaryFile =
    contract.files.find((f) => f.kind === "signed") ??
    contract.files.find((f) => f.kind === "system") ??
    contract.files[0];

  const downloadPrimary = async () => {
    if (!primaryFile) return;
    const blob = await resolveContractFileBlob(contract, primaryFile);
    if (!blob) {
      window.alert("فایل در دسترس نیست.");
      return;
    }
    triggerDownload(blob, primaryFile.name);
  };

  return (
    <DashboardPage
      title={contract.title}
      subtitle={`${contract.billAccount} · ${contract.type}`}
      action={
        <Button href="/dashboard/contracts" variant="outline" size="sm">
          بازگشت
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge
          status={contract.status}
          label={contract.status === "pending" ? "در انتظار امضا" : undefined}
        />
        {contract.expiresSoon && contract.status === "active" && (
          <StatusBadge status="warning" label="نزدیک انقضا" />
        )}
        {contract.renewalRequested && <StatusBadge status="info" label="درخواست تمدید ثبت شده" />}
        <StatusBadge
          status="billing"
          label={
            contract.roleScope === "business"
              ? "حقوقی"
              : contract.roleScope === "personal"
                ? "حقیقی"
                : "حقیقی / حقوقی"
          }
        />
      </div>

      <Panel className="mb-6">
        <PanelHeader title="اطلاعات قرارداد" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "شناسه", value: contract.id },
            { label: "واحد مصرفی", value: contract.billAccount },
            { label: "نوع", value: contract.type },
            { label: "پلن", value: contract.planName ?? "—" },
            { label: "شروع", value: contract.startDate },
            { label: "پایان", value: contract.endDate },
            { label: "حجم ماهانه", value: contract.volume },
            { label: "نرخ", value: contract.rate },
            { label: "صرفه‌جویی", value: contract.savings },
            { label: "تعداد فایل", value: String(contract.files.length) },
          ].map((field) => (
            <div key={field.label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{field.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{field.value}</p>
            </div>
          ))}
        </div>
        {contract.notes && (
          <p className="mt-4 text-sm text-slate-600">{contract.notes}</p>
        )}

        {contract.party && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs font-bold text-emerald-800">اطلاعات امضاکننده</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "نام", value: contract.party.fullName },
                { label: "کد ملی", value: contract.party.nationalId },
                { label: "شماره شناسنامه", value: contract.party.birthCertificateNumber },
                { label: "موبایل", value: contract.party.phone },
                { label: "شماره قرارداد", value: contract.party.contractNumber ?? "—" },
                { label: "تاریخ امضا", value: contract.party.signedAt ?? "—" },
              ].map((field) => (
                <div key={field.label} className="rounded-xl bg-white/80 p-3 ring-1 ring-emerald-100">
                  <p className="text-[11px] text-slate-500">{field.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{field.value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl bg-white/80 p-3 ring-1 ring-emerald-100">
                <p className="text-[11px] text-slate-500">نشانی</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{contract.party.address}</p>
              </div>
            </div>
            {contract.party.signatureDataUrl && (
              <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-emerald-100">
                <p className="mb-2 text-[11px] text-slate-500">امضای ثبت‌شده</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={contract.party.signatureDataUrl}
                  alt="امضا"
                  className="h-16 object-contain"
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {primaryFile && (
            <Button type="button" variant="outline" size="sm" onClick={() => void downloadPrimary()}>
              دانلود PDF اصلی
            </Button>
          )}
          {(contract.status === "active" || contract.status === "expired") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={contract.renewalRequested}
              onClick={() => {
                if (contract.renewalRequested) return;
                if (!window.confirm("درخواست تمدید ثبت شود؟")) return;
                requestContractRenewal(contract.id);
              }}
            >
              {contract.renewalRequested ? "تمدید ثبت شد" : "درخواست تمدید"}
            </Button>
          )}
          {contract.status === "draft" || contract.status === "pending" ? (
            <Button href={`/dashboard/contracts/${contract.id}/sign`} size="sm" className="group">
              تکمیل و امضای قرارداد
              <LinkArrow />
            </Button>
          ) : null}
        </div>
      </Panel>

      <Panel className="mb-6">
        <PanelHeader title="تاریخچه نسخه‌ها" description="نسخه‌های قرارداد و تغییرات" />
        <div className="space-y-3">
          {[...contract.versions].reverse().map((version) => (
            <div
              key={version.id}
              className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  نسخه {version.version} — {version.label}
                </p>
                <span className="text-xs text-slate-400">{version.date}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{version.note}</p>
            </div>
          ))}
        </div>
      </Panel>

      <ContractFilesPanel contract={contract} />
    </DashboardPage>
  );
}
