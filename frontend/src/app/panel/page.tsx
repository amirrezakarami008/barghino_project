import type { Metadata } from "next";
import { MetricGrid, WorkspacePage } from "@/features/workspace/workspace-page";

export const metadata: Metadata = { title: "پنل" };

export default function PanelHomePage() {
  return (
    <WorkspacePage
      title="خانه"
      lede="تولید، درآمد و قرارداد وقتی نیروگاه و قرائت به حساب وصل شود اینجا می‌آید. تا آن لحظه عدد ساختگی نشان نمی‌دهیم."
      icon="home"
      action={{ href: "/sell", label: "شروع فروش" }}
    >
      <MetricGrid
        items={[
          { label: "تولید", hint: "بعد از قرائت نیروگاه" },
          { label: "درآمد", hint: "بعد از صورت‌حساب دوره" },
          { label: "قرارداد فعال", hint: "بعد از امضا" },
          { label: "تسویه باز", hint: "بعد از سررسید" },
        ]}
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-panel border border-border bg-card p-5">
          <h3 className="font-semibold">گام بعدی</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">اگر نیروگاه دارید معرفی‌اش کنید. اگر ندارید درخواست نصب بدهید.</p>
        </section>
        <section className="rounded-panel border border-border bg-card p-5">
          <h3 className="font-semibold">فعالیت اخیر</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">رویدادی ثبت نشده است.</p>
        </section>
      </div>
    </WorkspacePage>
  );
}
