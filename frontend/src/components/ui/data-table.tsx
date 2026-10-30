import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./skeleton";
import { StatusPill } from "./status-pill";
import type { StatusTone } from "./types";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Show this field as primary title in mobile card fallback */
  mobilePrimary?: boolean;
  className?: string;
};

export type DataTableProps<T> = {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  statusAccessor?: (row: T) => StatusTone | undefined;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  statusAccessor,
  onRowClick,
  loading = false,
  emptyTitle = "موردی یافت نشد",
  emptyDescription = "هنوز داده‌ای برای نمایش وجود ندارد.",
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("space-y-3 rounded-lg border border-border bg-card p-4 shadow-soft", className)}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <span className="sr-only" role="status">
          در حال بارگذاری جدول
        </span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon="table"
        className={className}
      />
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card shadow-soft", className)}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[36rem] text-start text-sm">
          <thead className="sticky top-0 z-10 bg-surface text-foreground-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn("px-4 py-3 font-semibold", column.className)}
                >
                  {column.header}
                </th>
              ))}
              {statusAccessor ? (
                <th scope="col" className="px-4 py-3 font-semibold">
                  وضعیت
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = statusAccessor?.(row);
              return (
                <tr
                  key={getRowId(row)}
                  className={cn(
                    "border-t border-border transition-colors duration-fast ease-out hover:bg-surface/80",
                    onRowClick &&
                      "cursor-pointer focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? "button" : undefined}
                >
                  {columns.map((column) => (
                    <td key={column.id} className={cn("px-4 py-3", column.className)}>
                      {column.cell(row)}
                    </td>
                  ))}
                  {statusAccessor ? (
                    <td className="px-4 py-3">
                      {status ? <StatusPill status={status} /> : "—"}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {rows.map((row) => {
          const status = statusAccessor?.(row);
          const primary = columns.find((column) => column.mobilePrimary) ?? columns[0];
          return (
            <li
              key={getRowId(row)}
              className={cn("space-y-3 p-4", onRowClick && "cursor-pointer")}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-caption text-foreground-muted">{primary?.header}</p>
                  <div className="font-semibold">{primary ? primary.cell(row) : null}</div>
                </div>
                {status ? <StatusPill status={status} /> : null}
              </div>
              <dl className="grid gap-2">
                {columns
                  .filter((column) => column.id !== primary?.id)
                  .map((column) => (
                    <div key={column.id} className="flex items-baseline justify-between gap-3">
                      <dt className="text-caption text-foreground-muted">{column.header}</dt>
                      <dd className="text-sm">{column.cell(row)}</dd>
                    </div>
                  ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
