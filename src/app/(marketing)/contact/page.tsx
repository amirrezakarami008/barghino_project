import { CTASection } from "@/features/marketing/home/sections/CTASection";
import { PageBanner } from "@/features/marketing/components/PageBanner";
import { Container } from "@/shared/ui/Container";
import { Form } from "@/shared/ui/Form";
import { Section } from "@/shared/ui/Section";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/features/marketing/constants";
import { CONTACT_PAGE } from "@/features/marketing/constants/pages";
import { Mail, Phone } from "@/shared/lib/icons";
import type { FormField } from "@/shared/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: CONTACT_PAGE.meta.title,
  description: CONTACT_PAGE.meta.description,
};

const contactFields: FormField[] = [
  { name: "name", label: "نام و نام خانوادگی", type: "text", placeholder: "نام کامل", required: true },
  { name: "phone", label: "شماره تماس", type: "tel", placeholder: "۰۹۱۲۳۴۵۶۷۸۹", required: true },
  { name: "email", label: "ایمیل", type: "email", placeholder: "email@example.com" },
  {
    name: "subject",
    label: "موضوع",
    type: "select",
    required: true,
    options: CONTACT_PAGE.subjects.map((s) => ({ label: s.label, value: s.value })),
  },
  { name: "message", label: "پیام", type: "textarea", placeholder: "پیام خود را بنویسید...", required: true },
];

export default function ContactPage() {
  return (
    <>
      <PageBanner image={IMAGES.contact} alt="تماس با برق ما">
        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-200 backdrop-blur-sm">
          {CONTACT_PAGE.meta.badge}
        </span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{CONTACT_PAGE.hero.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">{CONTACT_PAGE.hero.description}</p>
      </PageBanner>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <h2 className="mb-6 text-xl font-bold text-slate-900">راه‌های ارتباطی</h2>
              <div className="space-y-6">
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 transition-colors hover:border-brand-200 hover:bg-brand-50/50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">تلفن</p>
                    <p className="text-sm text-slate-600">{SITE_CONFIG.phone}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 transition-colors hover:border-brand-200 hover:bg-brand-50/50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">ایمیل</p>
                    <p className="text-sm text-slate-600">{SITE_CONFIG.email}</p>
                  </div>
                </a>
              </div>

              {CONTACT_PAGE.offices.map((office) => (
                <div key={office.title} className="mt-8 rounded-2xl bg-slate-50 p-6">
                  <h3 className="mb-2 font-bold text-slate-900">{office.title}</h3>
                  <p className="mb-2 text-sm text-slate-600">{office.address}</p>
                  <p className="text-sm text-slate-500">ساعات کاری: {office.hours}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-3 lg:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">فرم تماس</h2>
              <Form fields={contactFields} submitLabel="ارسال پیام" />
            </div>
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
