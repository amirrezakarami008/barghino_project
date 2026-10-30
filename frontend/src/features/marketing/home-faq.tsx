"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { FaqList } from "@/features/marketing/faq-list";
import { Reveal } from "@/features/marketing/reveal";
import { Icon } from "@/shared/ui/icon";
import "./home-faq.css";

export function HomeFaq() {
  return (
    <section className="home-faq" aria-labelledby="home-faq-title">
      <Reveal>
        <div className="home-faq__layout">
          <aside className="home-faq__aside">
            <header>
              <h2 id="home-faq-title" className="text-h2">
                پرسش‌های رایج
              </h2>
              <p className="mt-3 text-body text-foreground-muted">
                جواب‌ها همان قواعد محصول‌اند. اعداد عمومی نمونه هستند.
              </p>
            </header>

            <div className="home-faq__help">
              <p className="home-faq__help-title">سؤال دیگری دارید؟</p>
              <Link href="/contact" className="home-faq__help-link">
                تماس
                <Icon name="arrow" className="size-3.5 -scale-x-100" />
              </Link>
            </div>

            <div className="home-faq__learn">
              <ButtonLink href="/learn" variant="ghost">
                مقالات و آموزش بیشتر
                <Icon name="arrow" className="size-4 -scale-x-100" />
              </ButtonLink>
            </div>
          </aside>

          <FaqList />
        </div>
      </Reveal>
    </section>
  );
}
