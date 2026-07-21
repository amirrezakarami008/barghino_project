import type { ReactNode } from "react";

interface ResponsiveTableProps {
  headers: string[];
  rows: ReactNode[][];
  mobileCards: ReactNode;
}

export function ResponsiveTable({ headers, rows, mobileCards }: ResponsiveTableProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">{mobileCards}</div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-right text-xs text-slate-500">
              {headers.map((header) => (
                <th key={header} className="pb-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-50 last:border-0">
                {cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface MobileDataCardProps {
  title: string;
  badge?: ReactNode;
  fields: { label: string; value: ReactNode }[];
  action?: ReactNode;
}

export function MobileDataCard({ title, badge, fields, action }: MobileDataCardProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-slate-900">{title}</p>
        {badge}
      </div>
      <dl className="space-y-2">
        {fields.map((field) => (
          <div key={field.label} className="flex items-start justify-between gap-3 text-sm">
            <dt className="shrink-0 text-slate-500">{field.label}</dt>
            <dd className="text-left font-medium text-slate-700">{field.value}</dd>
          </div>
        ))}
      </dl>
      {action && <div className="mt-3 border-t border-slate-100 pt-3">{action}</div>}
    </div>
  );
}
