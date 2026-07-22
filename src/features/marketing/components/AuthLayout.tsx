import { Container } from "@/shared/ui/Container";
import { MediaImage } from "@/shared/ui/MediaImage";
import { SITE_CONFIG } from "@/config";
import { IMAGES } from "@/features/marketing/constants";
import { Shield, TrendingDown, Clock, Zap } from "@/shared/lib/icons";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const FEATURES = [
  { icon: Clock, text: "ثبت‌نام در ۳ دقیقه" },
  { icon: TrendingDown, text: "تعرفه تا ۶۰٪ ارزان‌تر" },
  { icon: Shield, text: "پشتیبانی ۲۴/۷" },
];

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <MediaImage
          src={IMAGES.auth}
          alt="تامین برق و انرژی"
          overlay="gradient-rtl"
          className="absolute inset-0"
          sizes="50vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-mesh-dark bg-grid-dark opacity-60" />
        <div className="relative flex h-full flex-col justify-center p-16">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/20 ring-1 ring-brand-400/30 backdrop-blur-md">
            <Zap className="h-7 w-7 text-brand-300" />
          </div>
          <h2 className="mb-4 font-display text-4xl font-extrabold text-white">{SITE_CONFIG.name}</h2>
          <p className="mb-10 max-w-md text-lg leading-relaxed text-slate-300">
            {SITE_CONFIG.description}
          </p>
          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-5 w-5 text-brand-300" />
                </span>
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-mesh-light p-4 sm:p-6 lg:w-1/2 lg:bg-white lg:p-8">
        <Container size="narrow" className="max-w-md">
          {children}
        </Container>
      </div>
    </div>
  );
}
