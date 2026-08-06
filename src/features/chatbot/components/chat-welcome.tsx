"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { ChatSuggestions } from "@/features/chatbot/components/chat-suggestions";
import { chatbotBrand } from "@/features/chatbot/constants/data";

type ChatWelcomeProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export function ChatWelcome({ onSelect, disabled }: ChatWelcomeProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
      <div className="chatbot-orb pointer-events-none absolute top-1/2 left-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-3xl space-y-8 text-center"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="mx-auto flex size-16 items-center justify-center rounded-[1.4rem] border border-brand-200 bg-gradient-to-br from-brand-50 via-emerald-50 to-white text-brand-600 shadow-[0_12px_40px_-12px_rgb(16_185_129/0.35)]"
          >
            <Sparkles className="size-7" />
          </motion.div>

          <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">
            {chatbotBrand.eyebrow}
          </p>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {chatbotBrand.name}
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            {chatbotBrand.tagline}. بپرس، پیشنهاد بگیر، وضعیت نیروگاه و درآمدت را سریع‌تر بفهم —
            اتصال هوش مصنوعی به‌زودی فعال می‌شود.
          </p>
        </div>

        <ChatSuggestions onSelect={onSelect} disabled={disabled} />
      </motion.div>
    </div>
  );
}
