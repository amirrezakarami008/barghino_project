import { Container } from "@/shared/ui/Container";
import { SITE_CONFIG } from "@/config";
import { FOOTER_LINKS } from "@/features/marketing/constants";
import { Mail, Phone, Zap } from "@/shared/lib/icons";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-400">
      <div className="pointer-events-none absolute inset-0 bg-mesh-dark bg-grid-dark opacity-50" />
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/5 blur-[100px]" />

      <Container className="relative">
        <div className="grid gap-10 py-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5 lg:gap-10 lg:py-14">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-2xl font-extrabold text-white">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-400">
              {SITE_CONFIG.name}، سامانه آنلاین خرید برق در ایران با تنظیم قراردادهای دوجانبه و
              ارائه راهکارهای هوشمند، تامین برق را شفاف، منعطف و قابل‌اعتماد کرده است.
            </p>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="flex items-center gap-3 transition-colors hover:text-brand-300"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10">
                  <Phone className="h-4 w-4 text-brand-400" />
                </div>
                {SITE_CONFIG.phone}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-3 transition-colors hover:text-brand-300"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10">
                  <Mail className="h-4 w-4 text-brand-400" />
                </div>
                {SITE_CONFIG.email}
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-5 font-display text-sm font-bold text-white">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-brand-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t border-slate-800/80 py-8 text-center sm:flex-row sm:text-start">
          <p className="text-xs sm:text-sm">
            © {currentYear} {SITE_CONFIG.name.toUpperCase()}. تمامی حقوق محفوظ است.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:justify-end">
            <span className="rounded-lg border border-slate-700/80 bg-slate-900/50 px-4 py-2 font-medium text-slate-300">
              مجوز خرده‌فروشی
            </span>
            <span className="rounded-lg border border-slate-700/80 bg-slate-900/50 px-4 py-2 font-medium text-slate-300">
              نماد اعتماد
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
