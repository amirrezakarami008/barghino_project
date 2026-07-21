import { CTASection } from "@/components/sections/CTASection";
import { LandingPageTemplate } from "@/components/pages/LandingPageTemplate";
import { Container } from "@/components/ui/Container";
import { Form } from "@/components/ui/Form";
import { Section } from "@/components/ui/Section";
import { SITE_CONFIG, SUPPORT_PAGE } from "@/lib/constants";
import { Mail, Phone } from "@/lib/icons";
import type { FormField } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: SUPPORT_PAGE.meta.title,
  description: SUPPORT_PAGE.meta.description,
};

const ticketFields: FormField[] = [
  { name: "name", label: "نام", type: "text", required: true },
  { name: "phone", label: "شماره تماس", type: "tel", required: true },
  { name: "billId", label: "شناسه قبض (اختیاری)", type: "text" },
  { name: "message", label: "شرح مشکل", type: "textarea", required: true },
];

export default function SupportPage() {
  return (
    <>
      <LandingPageTemplate
        content={SUPPORT_PAGE}
        breadcrumbs={[
          { label: "خانه", href: "/" },
          { label: SUPPORT_PAGE.meta.title },
        ]}
        showCta={false}
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">تماس فوری</h2>
              <div className="space-y-4">
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 p-6 hover:border-brand-200"
                >
                  <Phone className="h-6 w-6 text-brand-600" />
                  <div>
                    <p className="font-medium text-slate-900">تلفن پشتیبانی</p>
                    <p className="text-brand-600">{SITE_CONFIG.phone}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 p-6 hover:border-brand-200"
                >
                  <Mail className="h-6 w-6 text-brand-600" />
                  <div>
                    <p className="font-medium text-slate-900">ایمیل</p>
                    <p className="text-brand-600">{SITE_CONFIG.email}</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">ثبت تیکت پشتیبانی</h2>
              <Form fields={ticketFields} submitLabel="ثبت تیکت" />
            </div>
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
