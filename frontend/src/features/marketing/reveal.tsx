"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/shared/lib/cn";

/** Start the fade before the block reaches the viewport, so it is settled when it arrives. */
const LEAD_PX = 640;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isNearViewport(node: HTMLElement, leadPx: number) {
  const rect = node.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewportHeight + leadPx && rect.bottom > -leadPx;
}

export function revealClassName(visible: boolean, armed: boolean) {
  return cn(
    armed &&
      "transition-[opacity,transform] duration-standard ease-out motion-reduce:transition-none motion-reduce:transform-none",
    visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
  );
}

/**
 * Visible in the server HTML. Hidden before paint only when the block is still
 * well below the fold, then revealed early so scroll never shows an empty gap.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  leadPx = LEAD_PX,
): { ref: RefObject<T | null>; visible: boolean; armed: boolean } {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion() || isNearViewport(node, leadPx)) {
      setVisible(true);
      setArmed(true);
      return;
    }

    setVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: `${leadPx}px 0px ${leadPx}px 0px` },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [leadPx]);

  useEffect(() => {
    setArmed(true);
  }, []);

  return { ref, visible, armed };
}

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible, armed } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={cn(revealClassName(visible, armed), className)}>
      {children}
    </div>
  );
}
