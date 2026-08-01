import { Container } from "@/shared/ui/Container";
import { SITE_CONFIG } from "@/config";
import { STATS } from "@/features/marketing/constants";
import { Clock, ShieldCheck, Sun, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STAT_ICONS: Record<string, LucideIcon> = {
  price: Sun,
  payout: Clock,
  paths: ShieldCheck,
  focus: Users,
};

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-brand-950 via-brand-900 to-emerald-950 py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

      <Container className="relative">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat) => {
            const Icon = STAT_ICONS[stat.id] ?? Sun;
            return (
              <div key={stat.id} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-display text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-xl font-bold text-brand-300 lg:text-2xl">{stat.suffix}</span>
                  )}
                </div>
                <p className="mt-2 max-w-[14rem] text-sm text-brand-100/70">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-brand-200/50">
          نمونه: {SITE_CONFIG.valueProps.governmentPrice} در برابر{" "}
          {SITE_CONFIG.valueProps.barghinoPrice} {SITE_CONFIG.valueProps.priceUnit}
        </p>
      </Container>
    </section>
  );
}
