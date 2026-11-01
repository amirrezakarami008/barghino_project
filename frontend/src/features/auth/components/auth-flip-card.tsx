"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import "./auth-flip-card.css";

const FLIP_EASE = [0.22, 1, 0.36, 1] as const;
const FLIP_MS = 0.75;

type AuthFlipCardProps = {
  isRegister: boolean;
  loginFace: ReactNode;
  registerFace: ReactNode;
  className?: string;
};

export function AuthFlipCard({
  isRegister,
  loginFace,
  registerFace,
  className,
}: AuthFlipCardProps) {
  const reduceMotion = useReducedMotion();
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const [animating, setAnimating] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const allowFlipAnim = useRef(false);
  const prevRegister = useRef(isRegister);
  const rotateY = useMotionValue(isRegister ? 180 : 0);
  const scale = useMotionValue(1);
  const frontOpacity = useMotionValue(isRegister ? 0 : 1);
  const backOpacity = useMotionValue(isRegister ? 1 : 0);

  useEffect(() => {
    allowFlipAnim.current = true;
  }, []);

  useLayoutEffect(() => {
    const active = isRegister ? backRef.current : frontRef.current;
    if (!active) return;

    const applyHeight = () => {
      const next = Math.ceil(active.getBoundingClientRect().height);
      if (next > 0) setHeight(next);
    };

    applyHeight();
    const observer = new ResizeObserver(applyHeight);
    observer.observe(active);
    return () => observer.disconnect();
  }, [isRegister]);

  useEffect(() => {
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back) return;

    if (isRegister) {
      front.setAttribute("inert", "");
      front.setAttribute("aria-hidden", "true");
      back.removeAttribute("inert");
      back.removeAttribute("aria-hidden");
    } else {
      back.setAttribute("inert", "");
      back.setAttribute("aria-hidden", "true");
      front.removeAttribute("inert");
      front.removeAttribute("aria-hidden");
    }
  }, [isRegister]);

  useEffect(() => {
    if (prevRegister.current === isRegister) {
      // Keep initial values synced on first paint without animation.
      rotateY.set(isRegister ? 180 : 0);
      frontOpacity.set(isRegister ? 0 : 1);
      backOpacity.set(isRegister ? 1 : 0);
      return;
    }
    prevRegister.current = isRegister;
    setLiveMessage(isRegister ? "فرم ثبت‌نام" : "فرم ورود");

    const finish = () => {
      setAnimating(false);
      if (stageRef.current) stageRef.current.style.willChange = "auto";
      focusFirstField(isRegister ? backRef.current : frontRef.current);
    };

    if (!allowFlipAnim.current) {
      rotateY.set(isRegister ? 180 : 0);
      frontOpacity.set(isRegister ? 0 : 1);
      backOpacity.set(isRegister ? 1 : 0);
      scale.set(1);
      return;
    }

    setAnimating(true);
    if (stageRef.current) stageRef.current.style.willChange = "transform";

    if (reduceMotion) {
      const a = animate(frontOpacity, isRegister ? 0 : 1, { duration: 0.15, ease: "easeOut" });
      const b = animate(backOpacity, isRegister ? 1 : 0, {
        duration: 0.15,
        ease: "easeOut",
        onComplete: finish,
      });
      rotateY.set(isRegister ? 180 : 0);
      return () => {
        a.stop();
        b.stop();
      };
    }

    const rotateControls = animate(rotateY, isRegister ? 180 : 0, {
      duration: FLIP_MS,
      ease: FLIP_EASE,
      onComplete: finish,
    });
    const scaleControls = animate(scale, [1, 0.97, 1], {
      duration: FLIP_MS,
      ease: FLIP_EASE,
    });
    frontOpacity.set(1);
    backOpacity.set(1);

    return () => {
      rotateControls.stop();
      scaleControls.stop();
    };
  }, [backOpacity, frontOpacity, isRegister, reduceMotion, rotateY, scale]);

  return (
    <div
      className={cn(
        "auth-flip",
        isRegister && "auth-flip--register",
        animating && !reduceMotion && "auth-flip--animating",
        className,
      )}
    >
      <div className="auth-flip__glow" aria-hidden />
      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>
      <div className="auth-flip__perspective" style={{ height: height === "auto" ? undefined : height }}>
        <div className="auth-flip__glass" aria-hidden>
          <div className="auth-flip__glass-inner" />
        </div>
        <motion.div
          ref={stageRef}
          className="auth-flip__stage"
          animate={{ height }}
          transition={{
            height: {
              duration: reduceMotion ? 0.15 : FLIP_MS,
              ease: FLIP_EASE,
            },
          }}
          style={{
            rotateY: reduceMotion ? 0 : rotateY,
            scale: reduceMotion ? 1 : scale,
          }}
        >
          {!reduceMotion ? (
            <div className="auth-flip__shine" aria-hidden>
              <div className="auth-flip__shine-sweep" />
            </div>
          ) : null}

          <motion.div
            ref={frontRef}
            className={cn(
              "auth-flip__face auth-flip__face--front",
              reduceMotion && "auth-flip__face--fade",
            )}
            style={{ opacity: reduceMotion ? frontOpacity : 1 }}
          >
            <div className="auth-flip__face-inner">{loginFace}</div>
          </motion.div>

          <motion.div
            ref={backRef}
            className={cn(
              "auth-flip__face auth-flip__face--back",
              reduceMotion && "auth-flip__face--fade",
            )}
            style={{
              opacity: reduceMotion ? backOpacity : 1,
              transform: reduceMotion ? "none" : undefined,
            }}
          >
            <div className="auth-flip__face-inner">{registerFace}</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function focusFirstField(root: HTMLElement | null) {
  if (!root) return;
  const target = root.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])',
  );
  target?.focus();
}
