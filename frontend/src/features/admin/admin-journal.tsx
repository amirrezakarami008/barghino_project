"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink, EmptyState } from "@/components/ui";
import { PanelArt } from "@/features/panel/panel-art";
import { faNumber } from "@/shared/lib/fa";
import { Icon } from "@/shared/ui/icon";
import "./admin-workspace.css";

type JournalArticle = {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly minutes: number;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function AdminJournal({
  articles,
}: {
  readonly articles: readonly JournalArticle[];
}): ReactElement {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <motion.div className="admin-workspace" {...motionProps}>
      <motion.section className="admin-ws-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div className="min-w-0">
          <p className="admin-ws-hero-eyebrow">محتوای سایت</p>
          <h2 className="admin-ws-hero-title">راهنماهای منتشرشده</h2>
          <p className="admin-ws-hero-body">
            فهرست فقط‌خواندنی راهنماهای عمومی سایت. ویرایش از این بخش هنوز فعال نیست.
          </p>
          <div className="mt-4">
            <ButtonLink href="/blog" className="admin-ws-hero-cta">
              <Icon name="eye" className="size-4" />
              مشاهده در سایت
            </ButtonLink>
          </div>
        </div>
        <div className="admin-ws-hero-art">
          <PanelArt name="installs/document" width={260} height={260} className="admin-ws-hero-image" />
        </div>
      </motion.section>

      {articles.length === 0 ? (
        <motion.div className="admin-ws-empty" variants={reduceMotion ? undefined : fadeUp}>
          <PanelArt name="installs/empty" width={180} height={180} className="admin-ws-empty-art" />
          <EmptyState
            hideIcon
            className="border-0 bg-transparent p-0 shadow-none"
            title="راهنمایی منتشر نشده"
            description="وقتی راهنما در سایت منتشر شود، اینجا دیده می‌شود."
            icon="book"
          />
        </motion.div>
      ) : (
        <>
          <p className="admin-ws-result">{faNumber(articles.length)} راهنما</p>
          <ul className="admin-ws-list">
            {articles.map((article) => (
              <motion.li key={article.slug} variants={reduceMotion ? undefined : fadeUp}>
                <article className="admin-ws-card">
                  <div className="admin-ws-card-top">
                    <div className="min-w-0">
                      <h3 className="admin-ws-card-title">{article.title}</h3>
                      <p className="admin-ws-card-hint">{article.summary}</p>
                    </div>
                    <span className="admin-ws-chip">{faNumber(article.minutes)} دقیقه</span>
                  </div>
                  <div className="admin-ws-card-foot">
                    <span className="admin-ws-result">فقط‌خواندنی · نمونه منتشرشده</span>
                    <div className="admin-ws-actions">
                      <ButtonLink href={`/blog/${article.slug}`} variant="secondary" size="sm">
                        باز کردن
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}
