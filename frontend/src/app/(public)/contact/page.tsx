import type { Metadata } from "next";
import { ContactForm } from "@/features/marketing/contact-form";
import { Card } from "@/components/ui";
import { Icon } from "@/shared/ui/icon";

export const metadata: Metadata = {
  title: "تماس",
  description:
    "با پشتیبانی برقینو درباره فروش برق، نصب نیروگاه یا قرارداد در تماس باشید. تلفن ۰۲۱-۴۴۰۰۰۶۶۴",
};

export default function ContactPage() {
  return (
    <div>
      <section className="bg-grad-aurora border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <p className="text-caption font-semibold text-accent">تماس</p>
          <h1 className="mt-2 max-w-3xl text-h1 text-balance">سؤال فروش، نصب یا قرارداد دارید؟</h1>
          <p className="mt-4 max-w-2xl text-body text-foreground-muted">
            فرم زیر متن را بررسی می‌کند؛ ارسال به صندوق پشتیبانی هنوز وصل نیست. تا آن زمان از تلفن یا ایمیل استفاده کنید.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <Card>
            <span className="grid size-11 place-items-center rounded-md bg-energy-50 text-energy-700">
              <Icon name="headset" className="size-5" />
            </span>
            <h2 className="mt-4 text-h4">تلفن</h2>
            <p className="mt-2 text-sm tabular-nums text-foreground-muted" dir="ltr">
              ۰۲۱-۴۴۰۰۰۶۶۴
            </p>
          </Card>
          <Card>
            <span className="grid size-11 place-items-center rounded-md bg-volt-50 text-volt-700">
              <Icon name="bell" className="size-5" />
            </span>
            <h2 className="mt-4 text-h4">ایمیل</h2>
            <p className="mt-2 text-sm text-foreground-muted" dir="ltr">
              info@bargheto.com
            </p>
          </Card>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}
