import type { Metadata } from "next";
import { WorkspacePage } from "@/features/workspace/workspace-page";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
export const metadata: Metadata = { title: "پنل" };
export default function PanelHomePage() {
  return <WorkspacePage title="فضای کار شما" lede="قراردادهای فروش برق، وضعیت نیروگاه و اطلاعات حساب خود را از اینجا دنبال کنید." icon="home" action={{ href: "/panel/contracts/new", label: "شروع قرارداد" }}><div className="grid gap-4 md:grid-cols-2"><section className="rounded-panel border border-border bg-card p-6"><span className="inline-grid size-11 place-items-center rounded-xl bg-info text-primary"><Icon name="file" /></span><h2 className="mt-4 text-lg font-semibold">قراردادهای من</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">ثبت انشعاب و نیروگاه، انتخاب پلن و پیگیری بررسی شرکت در مسیر قرارداد انجام می‌شود.</p><ButtonLink href="/panel/contracts" variant="secondary" className="mt-5">مشاهدهٔ قراردادها</ButtonLink></section><section className="rounded-panel border border-border bg-card p-6"><span className="inline-grid size-11 place-items-center rounded-xl bg-mint text-emerald"><Icon name="solarPanel" /></span><h2 className="mt-4 text-lg font-semibold">نیروگاه من</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">مشخصات نیروگاه‌های ثبت‌شده و نتیجهٔ بررسی آن‌ها را ببینید.</p><ButtonLink href="/panel/plant" variant="secondary" className="mt-5">مشاهدهٔ نیروگاه‌ها</ButtonLink></section></div></WorkspacePage>;
}
