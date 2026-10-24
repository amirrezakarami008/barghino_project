import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "تولید و درآمد" };

export default function ProductionPage() {
  return (
    <WorkspacePage icon="chart" title="تولید و درآمد" lede="نمودار خطی تولید و درآمد فقط با قرائت واقعی نیروگاه شما رسم می‌شود.">
      <div className="rounded-panel border border-border bg-card p-5">
        <p className="text-sm font-semibold">روند تولید</p>
        <div className="mt-4 grid h-48 place-items-center rounded-2xl border border-dashed border-border bg-surface text-sm text-muted-foreground">
          سری زمانی موجود نیست
        </div>
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">جدول تولید، خالی تا رسیدن قرائت</caption>
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-2 text-start font-medium">دوره</th>
              <th className="py-2 text-start font-medium">kWh</th>
              <th className="py-2 text-start font-medium">درآمد</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="py-4 text-muted-foreground">
                ردیفی نیست.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </WorkspacePage>
  );
}
