import { DashboardPage, Panel, PanelHeader } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { DOCUMENTS } from "@/features/dashboard/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "اسناد" };

const typeColors: Record<string, string> = {
  قرارداد: "bg-violet-50 text-violet-700",
  فاکتور: "bg-amber-50 text-amber-700",
  گواهی: "bg-emerald-50 text-emerald-700",
  مجوز: "bg-brand-50 text-brand-700",
};

export default function DocumentsPage() {
  return (
    <DashboardPage title="اسناد و مدارک" subtitle="قراردادها، فاکتورها و گواهی‌های رسمی">
      <Panel>
        <PanelHeader title="فایل‌های ذخیره‌شده" description={`${DOCUMENTS.length} سند`} />
        <div className="space-y-3">
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  PDF
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{doc.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[doc.type]}`}>
                      {doc.type}
                    </span>
                    <span className="text-xs text-slate-500">{doc.date}</span>
                    <span className="text-xs text-slate-400">{doc.size}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">دانلود</Button>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}
