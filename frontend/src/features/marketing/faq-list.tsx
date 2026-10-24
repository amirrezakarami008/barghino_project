"use client";

import { useId, useState } from "react";
import { cx } from "@/shared/lib/cx";

const items = [
  {
    q: "برقینو برق را با چه قیمتی می‌خرد؟",
    a: "مبنای خرید، نرخ بورس سبز است. عدد ۱۵٬۰۰۰ تومان در برابر ۵٬۰۰۰ تومان نمونه محصول است و نرخ زنده نیست.",
  },
  {
    q: "پول کی می‌رسد؟",
    a: "تعهد محصول، تسویه حداکثر دو ماه با قرارداد رسمی است. مسیر دولتی در نمونه محصول تا حدود شش ماه طول می‌کشد.",
  },
  {
    q: "برای چه کسی است؟",
    a: "برای مشترک خانگی. اگر نیروگاه دارید مسیر فروش را شروع می‌کنید. اگر ندارید، اول درخواست نصب می‌دهید.",
  },
  {
    q: "بدون نیروگاه هم می‌شود شروع کرد؟",
    a: "بله. درخواست نصب، بررسی، پیشنهاد و قرارداد نصب طی می‌شود. بعد از بهره‌برداری همان نیروگاه وارد فروش برق می‌شود.",
  },
  {
    q: "قرارداد چه تضمینی می‌دهد؟",
    a: "قیمت، زمان تسویه و طرف قرارداد مکتوب می‌شود. خودِ وجود قرارداد جای وعده شفاهی را می‌گیرد.",
  },
];

export function FaqList() {
  const [open, setOpen] = useState(0);
  const base = useId();

  return (
    <div className="mt-8 grid gap-3">
      {items.map((item, index) => {
        const expanded = open === index;
        const panelId = `${base}-${index}`;
        return (
          <div key={item.q} className="rounded-panel border border-border bg-card">
            <h2>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-start text-base font-semibold"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                {item.q}
                <span className={cx("text-emerald transition-transform", expanded && "rotate-45")} aria-hidden>
                  +
                </span>
              </button>
            </h2>
            <div id={panelId} role="region" hidden={!expanded} className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
