"use client";

import { MobileDataCard, StatusBadge } from "@/features/dashboard/components";
import { cn } from "@/shared/lib/utils";
import type { Contract } from "../types";
import { ContractRowActions } from "./ContractRowActions";

interface ContractsTableProps {
  contracts: Contract[];
}

function StatusCell({ contract }: { contract: Contract }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusBadge
        status={contract.status}
        label={contract.status === "pending" ? "در انتظار امضا" : undefined}
      />
      {contract.expiresSoon && contract.status === "active" && (
        <StatusBadge status="warning" label="نزدیک انقضا" />
      )}
    </div>
  );
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  return (
    <>
      <div className="space-y-3 lg:hidden">
        {contracts.map((contract) => (
          <MobileDataCard
            key={contract.id}
            title={contract.title}
            badge={<StatusCell contract={contract} />}
            fields={[
              { label: "واحد", value: contract.billAccount },
              { label: "نوع", value: contract.type },
              {
                label: "دوره",
                value:
                  contract.startDate === "—"
                    ? "—"
                    : `${contract.startDate} تا ${contract.endDate}`,
              },
              { label: "صرفه‌جویی", value: contract.savings },
            ]}
            action={
              <div className="flex justify-end">
                <ContractRowActions contract={contract} />
              </div>
            }
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-100 lg:block">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-50/90 text-right text-xs font-semibold tracking-wide text-slate-500">
              <th className="px-4 py-3.5">قرارداد</th>
              <th className="px-4 py-3.5">نوع</th>
              <th className="px-4 py-3.5">دوره</th>
              <th className="px-4 py-3.5">صرفه‌جویی</th>
              <th className="px-4 py-3.5">وضعیت</th>
              <th className="px-4 py-3.5 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, index) => (
              <tr
                key={contract.id}
                className={cn(
                  "border-t border-slate-100 transition-colors hover:bg-brand-50/30",
                  index % 2 === 1 && "bg-slate-50/40",
                )}
              >
                <td className="px-4 py-4 align-middle">
                  <p className="truncate font-semibold text-slate-900">{contract.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{contract.billAccount}</p>
                  {contract.renewalRequested && (
                    <p className="mt-1 text-[11px] font-medium text-brand-600">تمدید در جریان</p>
                  )}
                </td>
                <td className="px-4 py-4 align-middle">
                  <p className="truncate text-slate-700">{contract.type}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{contract.volume}</p>
                </td>
                <td className="px-4 py-4 align-middle">
                  {contract.startDate === "—" ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <div className="space-y-0.5 text-xs leading-5 text-slate-600">
                      <p>
                        <span className="text-slate-400">از </span>
                        {contract.startDate}
                      </p>
                      <p>
                        <span className="text-slate-400">تا </span>
                        {contract.endDate}
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 align-middle">
                  <span
                    className={cn(
                      "inline-flex rounded-lg px-2 py-1 text-sm font-bold",
                      contract.savings === "—"
                        ? "bg-slate-100 text-slate-400"
                        : "bg-emerald-50 text-emerald-700",
                    )}
                  >
                    {contract.savings}
                  </span>
                </td>
                <td className="px-4 py-4 align-middle">
                  <StatusCell contract={contract} />
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex justify-end">
                    <ContractRowActions contract={contract} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
