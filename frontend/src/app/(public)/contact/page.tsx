import type { Metadata } from "next";
import { ContactForm } from "@/features/marketing/contact-form";
import { InfoShell, PageIntro } from "@/features/marketing/info";

export const metadata: Metadata = { title: "تماس" };

export default function ContactPage() {
  return (
    <InfoShell>
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <PageIntro
          eyebrow="تماس"
          title="سؤال فروش، نصب یا تسویه دارید؟"
          lede="تلفن ۰۲۱-۴۴۰۰۰۶۶۴ و ایمیل info@bargheto.com. فرم زیر متن را بررسی می‌کند؛ ارسال به صندوق هنوز وصل نیست."
        />
        <ContactForm />
      </div>
    </InfoShell>
  );
}
