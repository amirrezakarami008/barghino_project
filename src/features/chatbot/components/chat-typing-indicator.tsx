"use client";

import { motion } from "framer-motion";

type ChatTypingIndicatorProps = {
  label?: string;
};

export function ChatTypingIndicator({
  label = "دستیار برقینو در حال فکر کردن…",
}: ChatTypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-2 ring-1 ring-brand-100">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="size-1.5 rounded-full bg-brand-500"
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: index * 0.16,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
