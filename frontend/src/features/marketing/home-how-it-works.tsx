"use client";

import { motion, useReducedMotion } from "framer-motion";
import { revealClassName, useReveal } from "@/features/marketing/reveal";
import { formatFa } from "@/shared/lib/fa";
import { Icon, type IconName } from "@/shared/ui/icon";
import "./home-how-it-works.css";

const steps: {
  id: string;
  label: string;
  description: string;
  icon: IconName;
}[] = [
  {
    id: "sub",
    label: "ثبت انشعاب",
    description: "اطلاعات انشعاب خانگی",
    icon: "home",
  },
  {
    id: "plant",
    label: "ثبت نیروگاه",
    description: "ظرفیت و مشخصات",
    icon: "solarPanel",
  },
  {
    id: "review",
    label: "بررسی شرکت",
    description: "بازبینی کارشناس",
    icon: "shield",
  },
  {
    id: "plan",
    label: "انتخاب پلن",
    description: "شرایط توافقی",
    icon: "plan",
  },
  {
    id: "draft",
    label: "پیش‌نویس قرارداد",
    description: "آمادهٔ بازبینی شما",
    icon: "file",
  },
];

export function HomeHowItWorks() {
  const { ref, visible, armed } = useReveal<HTMLDivElement>();
  const reduceMotion = useReducedMotion();

  const lineTransition = reduceMotion || !visible
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section className="home-how" aria-labelledby="home-how-title">
      <div className="home-how__inner">
        <div ref={ref} className={revealClassName(visible, armed)}>
          <header className="mx-auto max-w-2xl text-center">
            <h2 id="home-how-title" className="text-h2">
              چطور کار می‌کند؟
            </h2>
            <p className="mt-3 text-body text-foreground-muted">
              پنج گام مشخص تا پیش‌نویس قرارداد — هر وضعیت در پنل دیده می‌شود.
            </p>
          </header>

          <div className="home-how__panel">
            <div className="home-how__track">
              <div className="home-how__rail" aria-hidden>
                <motion.div
                  className="home-how__rail-fill"
                  initial={false}
                  animate={{ scaleX: visible ? 1 : 0 }}
                  transition={lineTransition}
                />
              </div>

              <div className="home-how__v-line" aria-hidden>
                <motion.div
                  className="home-how__v-line-fill"
                  initial={false}
                  animate={{ scaleY: visible ? 1 : 0 }}
                  transition={lineTransition}
                />
              </div>

              <ol className="home-how__list">
                {steps.map((step, index) => (
                  <li key={step.id} className="home-how__step">
                    <span className="home-how__index" aria-hidden>
                      {formatFa(index + 1)}
                    </span>
                    <div className="min-w-0">
                      <span className="home-how__icon" aria-hidden>
                        <Icon name={step.icon} className="size-4" />
                      </span>
                      <h3 className="home-how__title">{step.label}</h3>
                      <p className="home-how__desc">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
