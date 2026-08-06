import { Container } from "@/shared/ui/Container";
import { getIcon } from "@/shared/lib/icons";
import { FEATURES } from "@/features/marketing/constants";
import { createElement } from "react";

export function WhyUsSection() {
  return (
    <section id="why-us" className="bg-slate-50/80 py-12 sm:py-14 lg:py-16">
      <Container>
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            چرا برقینو؟
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            دلایل ساده برای انتخاب برقینو به‌جای فروش مستقیم به دولت.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="group flex flex-col items-center rounded-2xl border border-transparent bg-transparent px-3 py-4 text-center transition-colors hover:border-slate-200 hover:bg-white hover:shadow-sm sm:px-2"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-transform duration-300 group-hover:scale-105 group-hover:bg-brand-500 group-hover:text-white group-hover:ring-brand-500">
                {createElement(getIcon(feature.icon), { className: "h-6 w-6" })}
              </div>
              <h3 className="font-display text-sm font-bold text-slate-900 sm:text-base">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
