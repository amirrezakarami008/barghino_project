"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { cn } from "@/shared/lib/cn";
import "./faq-list.css";

export const faqItems = [
  {
    q: "برقینو برق را با چه قیمتی می‌خرد؟",
    a: "مبنای خرید، نرخ توافق‌شده در قرارداد است و می‌تواند به بورس سبز وابسته باشد. هر عددی در صفحات عمومی نمونه است، نه نرخ زنده.",
  },
  {
    q: "زمان تسویه چقدر است؟",
    a: "سررسید تسویه در قرارداد نوشته می‌شود. نمونهٔ محصول حداکثر دو ماه را نشان می‌دهد؛ این وعدهٔ تضمینی درآمد نیست و باید در متن قرارداد شما باشد.",
  },
  {
    q: "برقینو برای چه کسی است؟",
    a: "برای مشترک خانگی. اگر نیروگاه دارید مسیر فروش را شروع می‌کنید. اگر ندارید، اول درخواست نصب می‌دهید.",
  },
  {
    q: "بدون نیروگاه هم می‌شود شروع کرد؟",
    a: "بله. درخواست نصب، بررسی، پیشنهاد و قرارداد نصب طی می‌شود. بعد از بهره‌برداری همان نیروگاه می‌تواند وارد مسیر فروش شود.",
  },
  {
    q: "اگر درخواست رد شود چه می‌بینم؟",
    a: "دلیل رد به‌صورت قابل‌مشاهده در پنل ثبت می‌شود تا بتوانید اصلاح کنید؛ تاریخچهٔ وضعیت قرارداد هم قابل پیگیری است.",
  },
  {
    q: "مدارک من کجا نگه داشته می‌شود؟",
    a: "فایل‌های هویتی و قرارداد در فضای خصوصی حساب ذخیره می‌شوند و فقط برای شما و کارشناس مجاز برقینو قابل دسترسی‌اند.",
  },
] as const;

export function FaqList({ className }: { className?: string }) {
  const [open, setOpen] = useState(0);
  const base = useId();
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTrigger = useCallback((index: number) => {
    const next = (index + faqItems.length) % faqItems.length;
    triggersRef.current[next]?.focus();
  }, []);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusTrigger(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusTrigger(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTrigger(0);
        break;
      case "End":
        event.preventDefault();
        focusTrigger(faqItems.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("faq-list", className)}>
      {faqItems.map((item, index) => {
        const expanded = open === index;
        const panelId = `${base}-panel-${index}`;
        const buttonId = `${base}-button-${index}`;

        return (
          <div key={item.q} className={cn("faq-item", expanded && "faq-item--open")}>
            <div className="faq-item__shell">
              <h3 className="m-0">
                <button
                  ref={(node) => {
                    triggersRef.current[index] = node;
                  }}
                  id={buttonId}
                  type="button"
                  className="faq-item__trigger"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen(expanded ? -1 : index)}
                  onKeyDown={(event) => onTriggerKeyDown(event, index)}
                >
                  <span>{item.q}</span>
                  <span className="faq-item__icon" aria-hidden>
                    <svg
                      className="faq-item__icon-glyph"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M10 4v12M4 10h12" />
                    </svg>
                  </span>
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="faq-item__panel"
              >
                <div className="faq-item__clip">
                  <div className="faq-item__content">{item.a}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
