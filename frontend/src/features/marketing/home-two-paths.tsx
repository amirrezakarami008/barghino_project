"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { Badge, ButtonLink } from "@/components/ui";
import { Reveal } from "@/features/marketing/reveal";
import { Icon, type IconName } from "@/shared/ui/icon";
import "./home-two-paths.css";

/**
 * TODO: add `public/images/path-sell.webp` and `public/images/path-install.webp`.
 * Until then each card uses a gradient placeholder with the same frame.
 */
const PATH_IMAGES = {
  sell: null as string | null,
  install: null as string | null,
};

type PathBullet = { icon: IconName; text: string };

type PathCardData = {
  id: "sell" | "install";
  title: string;
  lede: string;
  href: string;
  cta: string;
  bullets: PathBullet[];
  primary: boolean;
  badge?: string;
  imageSrc: string | null;
};

const paths: PathCardData[] = [
  {
    id: "sell",
    title: "فروش برق",
    lede: "نیروگاه موجود را معرفی کنید، مراحل بررسی را طی کنید و پیش‌نویس قرارداد فروش را ببینید.",
    href: "/services#sell",
    cta: "جزئیات مسیر فروش",
    primary: true,
    imageSrc: PATH_IMAGES.sell,
    bullets: [
      { icon: "solarPanel", text: "نیروگاه موجود را معرفی کنید" },
      { icon: "shield", text: "مراحل بررسی را طی کنید" },
      { icon: "file", text: "پیش‌نویس قرارداد فروش را ببینید" },
    ],
  },
  {
    id: "install",
    title: "نصب نیروگاه",
    lede: "از درخواست تا بهره‌برداری را دنبال کنید؛ بعد از راه‌اندازی می‌توانید وارد مسیر فروش شوید.",
    href: "/services#install",
    cta: "جزئیات مسیر نصب",
    primary: false,
    badge: "در حال تکمیل",
    imageSrc: PATH_IMAGES.install,
    bullets: [
      { icon: "plant", text: "از درخواست تا بهره‌برداری را دنبال کنید" },
      { icon: "clock", text: "بعد از راه‌اندازی" },
      { icon: "bolt", text: "می‌توانید وارد مسیر فروش شوید" },
    ],
  },
];

function setSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

function PathCard({ path }: { path: PathCardData }) {
  return (
    <article
      className={
        path.id === "install" ? "home-path-card home-path-card--install" : "home-path-card"
      }
      onMouseMove={setSpotlight}
    >
      <div className="home-path-card__inner">
        <div className="home-path-card__spot" aria-hidden />

        <div className="home-path-card__media">
          {path.imageSrc ? (
            <Image
              src={path.imageSrc}
              alt={path.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          ) : (
            <div className="home-path-card__placeholder" aria-hidden>
              {/* TODO: add public/images/path-{sell|install}.webp */}
            </div>
          )}
        </div>

        <div className="home-path-card__body">
          <div className="home-path-card__title-row">
            <h3 className="text-h3">{path.title}</h3>
            {path.badge ? <Badge tone="pending">{path.badge}</Badge> : null}
          </div>

          <p className="home-path-card__lede">{path.lede}</p>

          <ul className="home-path-card__bullets">
            {path.bullets.map((bullet) => (
              <li key={bullet.text} className="home-path-card__bullet">
                <span className="home-path-card__bullet-icon" aria-hidden>
                  <Icon name={bullet.icon} className="size-3.5" />
                </span>
                <span>{bullet.text}</span>
              </li>
            ))}
          </ul>

          <div className="home-path-card__actions">
            <ButtonLink
              href={path.href}
              className={
                path.primary
                  ? "home-path-card__cta-primary w-full"
                  : "home-path-card__cta-outline w-full"
              }
              variant={path.primary ? "primary" : "ghost"}
            >
              {path.cta}
              <Icon name="arrow" className="size-4 -scale-x-100" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}

export function HomeTwoPaths() {
  return (
    <section className="home-paths" aria-labelledby="home-paths-title">
      <Reveal>
        <header className="mx-auto max-w-2xl text-center">
          <h2 id="home-paths-title" className="text-h2">
            دو مسیر، یک پلتفرم
          </h2>
          <p className="mt-3 text-body text-foreground-muted">
            بسته به این‌که نیروگاه دارید یا می‌خواهید نصب کنید، مسیر مشخص است.
          </p>
        </header>
        <div className="home-paths__grid">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
