import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { SITE_CONFIG } from "@/config";
import { REGISTRATION_STEPS } from "@/features/marketing/constants";
import { ArrowLeft } from "@/shared/lib/icons";

export function StepsSection() {
  return (
    <section id="steps" className="bg-white py-12 sm:py-14 lg:py-16">
      <Container>
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            مسیر همکاری با برقینو در ۳ گام
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            بدون پیچیدگی صنعتی. فقط مسیر فروش برق خانگی یا درخواست نصب.
          </p>
        </div>

        <div className="relative mx-auto mb-10 grid max-w-4xl gap-4 md:grid-cols-3 md:gap-0">
          {REGISTRATION_STEPS.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center text-center md:px-4">
              {index < REGISTRATION_STEPS.length - 1 && (
                <div
                  className="pointer-events-none absolute left-0 top-7 z-0 hidden w-full items-center justify-start md:flex"
                  aria-hidden
                >
                  <div className="mr-auto flex w-1/2 items-center justify-center">
                    <div className="h-px flex-1 border-t-2 border-dashed border-brand-200" />
                    <ArrowLeft className="mx-1 h-4 w-4 shrink-0 text-brand-300" />
                  </div>
                </div>
              )}

              <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 font-display text-xl font-extrabold text-white shadow-lg shadow-brand-500/25">
                {step.step}
              </div>

              <div className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-5 transition-colors hover:border-brand-200 hover:bg-white sm:px-5">
                <h3 className="font-display text-base font-bold text-slate-900 sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button href={SITE_CONFIG.registerHref} size="lg">
            شروع ثبت‌نام
          </Button>
        </div>
      </Container>
    </section>
  );
}
