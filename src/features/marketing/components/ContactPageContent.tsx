"use client";

import { ContactFormSection } from "@/features/marketing/components/ContactFormSection";
import { CONTACT_PAGE } from "@/features/marketing/constants/pages";
import { IMAGES } from "@/shared/constants/images";
import { SITE_CONFIG } from "@/config";
import { Container } from "@/shared/ui/Container";
import { Accordion } from "@/shared/ui/Interactive";
import { cn } from "@/shared/lib/utils";
import {
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createElement, type ComponentType } from "react";

const office = CONTACT_PAGE.offices[0]!;

function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function telHref(value: string) {
  return `tel:${toLatinDigits(value).replace(/[^\d+]/g, "")}`;
}

function whatsappHref(value: string) {
  const digits = toLatinDigits(value).replace(/\D/g, "");
  const national = digits.startsWith("0") ? digits.slice(1) : digits;
  return `https://wa.me/98${national}`;
}

const PERK_ICONS = {
  MessageCircle,
  Headphones,
  Zap,
} as const;

const CHANNELS: {
  id: string;
  label: string;
  value: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    id: "phone",
    label: "تلفن",
    value: SITE_CONFIG.phone,
    href: telHref(SITE_CONFIG.phone),
    icon: Phone,
  },
  {
    id: "email",
    label: "ایمیل",
    value: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
    icon: Mail,
  },
  {
    id: "whatsapp",
    label: "واتساپ",
    value: CONTACT_PAGE.whatsapp,
    href: whatsappHref(CONTACT_PAGE.whatsapp),
    icon: MessageCircle,
  },
  {
    id: "address",
    label: "آدرس دفتر",
    value: office.address,
    icon: MapPin,
  },
  {
    id: "hours",
    label: "ساعات کاری",
    value: office.hours,
    icon: Clock,
  },
];

export function ContactPageContent() {
  return (
    <div className="bg-[#f7f8fa]">
      <ContactHero />
      <ContactChannelsAndForm />
      <OfficeVisitSection />
      <ContactFaqSection />
      <ContactQuickCta />
    </div>
  );
}

function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <Container className="relative py-10 sm:py-14 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="mb-4 inline-flex items-center rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
              {CONTACT_PAGE.meta.badge}
            </span>
            <h1 className="font-display text-3xl font-black leading-snug tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
              {CONTACT_PAGE.hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
              {CONTACT_PAGE.hero.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {CONTACT_PAGE.hero.perks.map((perk) => (
                <div
                  key={perk.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 text-center shadow-sm shadow-slate-900/5"
                >
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    {createElement(PERK_ICONS[perk.icon], { className: "h-5 w-5" })}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{perk.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">{perk.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/80 sm:aspect-[5/4]">
              <Image
                src={IMAGES.contactPage.hero}
                alt="خانه با پنل خورشیدی"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-4 right-4 left-4 sm:bottom-5 sm:right-5 sm:left-auto sm:w-[15.5rem]">
              <div className="rounded-2xl border border-white/15 bg-brand-800/95 p-4 text-white shadow-xl backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{CONTACT_PAGE.hero.helpCard.title}</p>
                    <a
                      href={telHref(SITE_CONFIG.phone)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-400"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {SITE_CONFIG.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ContactChannelsAndForm() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr] lg:gap-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
            <ContactFormSection />
          </div>

          <div>
            <h2 className="mb-5 font-display text-xl font-bold text-slate-900 sm:text-2xl">
              {CONTACT_PAGE.channelsTitle}
            </h2>
            <div className="space-y-3">
              {CHANNELS.map((channel) => {
                const body = (
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                      <channel.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-500">{channel.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">{channel.value}</p>
                    </div>
                  </div>
                );

                return channel.href ? (
                  <a
                    key={channel.id}
                    href={channel.href}
                    target={channel.id === "whatsapp" ? "_blank" : undefined}
                    rel={channel.id === "whatsapp" ? "noreferrer" : undefined}
                    className="block"
                  >
                    {body}
                  </a>
                ) : (
                  <div key={channel.id}>{body}</div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function OfficeVisitSection() {
  return (
    <section className="pb-10 sm:pb-14">
      <Container>
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">
                {CONTACT_PAGE.officeVisit.title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                {CONTACT_PAGE.officeVisit.description}
              </p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="flex items-start gap-2 text-sm font-semibold text-slate-800">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {office.address}
                </p>
                <p className="mt-2 text-xs text-slate-500">{office.hours}</p>
              </div>
              <div className="mt-6">
                <a
                  href={office.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brand-600 via-brand-500 to-brand-400 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:brightness-110"
                >
                  <MapPin className="h-4 w-4" />
                  {CONTACT_PAGE.officeVisit.mapCta}
                </a>
              </div>
            </div>

            <div className="relative min-h-[240px] bg-slate-100 lg:min-h-[320px]">
              <Image
                src={IMAGES.contactPage.map}
                alt="موقعیت دفتر برقینو روی نقشه"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/30" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/40 ring-4 ring-white">
                    <Zap className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ContactFaqSection() {
  return (
    <section className="bg-white py-10 sm:py-14">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="mb-6 font-display text-2xl font-black text-slate-900 sm:text-3xl">
              {CONTACT_PAGE.faqTitle}
            </h2>
            <Accordion items={[...CONTACT_PAGE.faq]} />
            <p className="mt-5 text-sm text-slate-500">
              سوال بیشتری دارید؟{" "}
              <Link href="/faq" className="font-bold text-brand-700 hover:text-brand-800">
                همه سوالات متداول
              </Link>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-50 via-white to-emerald-50 p-6 ring-1 ring-brand-100/80 sm:p-8">
              <Image
                src={IMAGES.contactPage.faq}
                alt="سوالات متداول درباره نیروگاه خورشیدی"
                fill
                className="object-contain p-4 sm:p-6"
                sizes="(max-width: 1024px) 90vw, 420px"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ContactQuickCta() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-12",
            "bg-gradient-to-l from-[#04352f] via-[#0a4a3f] to-[#0d5c4d]",
          )}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-brand-300/15 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="relative grid items-center gap-6 lg:grid-cols-[1.2fr_auto_auto] lg:gap-8">
            <div className="text-white">
              <h2 className="font-display text-2xl font-black sm:text-3xl">{CONTACT_PAGE.cta.title}</h2>
              <p className="mt-2 max-w-lg text-sm leading-7 text-emerald-100/90 sm:text-base">
                {CONTACT_PAGE.cta.description}
              </p>
            </div>

            <div className="relative mx-auto h-28 w-28 shrink-0 sm:h-32 sm:w-32">
              <Image
                src={IMAGES.contactPage.headphones}
                alt=""
                fill
                className="object-contain drop-shadow-2xl"
                sizes="128px"
              />
            </div>

            <a
              href={telHref(SITE_CONFIG.phone)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-300/70 bg-emerald-500/15 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-emerald-400/25"
            >
              <Headphones className="h-4 w-4" />
              {CONTACT_PAGE.cta.button}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
