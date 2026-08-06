"use client";

import { useRef, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Square } from "lucide-react";

import { ChatbotButton } from "@/features/chatbot/components/chatbot-button";
import { cn } from "@/shared/lib/utils";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onStop?: () => void;
  isThinking?: boolean;
  placeholder?: string;
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  isThinking,
  placeholder = "از دستیار برقینو بپرس… تولید، درآمد، سلامت نیروگاه",
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !isThinking;

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    onSubmit(value);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <motion.div
        layout
        className={cn(
          "relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-shadow focus-within:border-brand-300 focus-within:shadow-[0_0_0_1px_rgb(16_185_129/0.15),0_16px_40px_-24px_rgb(16_185_129/0.35)]",
        )}
      >
        <div className="chatbot-composer-sheen pointer-events-none absolute inset-0 opacity-70" />

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            const node = event.target;
            node.style.height = "auto";
            node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isThinking}
          className="relative z-10 max-h-40 min-h-[3.25rem] w-full resize-none bg-transparent px-5 pt-4 pb-14 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-70"
        />

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 px-3 pb-3">
          <p className="ps-2 text-[11px] text-slate-400">Enter ارسال · Shift+Enter خط جدید</p>

          {isThinking ? (
            <ChatbotButton
              type="button"
              size="icon"
              variant="outline"
              className="size-10 rounded-2xl"
              onClick={onStop}
              aria-label="توقف"
            >
              <Square className="size-3.5 fill-current" />
            </ChatbotButton>
          ) : (
            <ChatbotButton
              type="submit"
              size="icon"
              disabled={!canSend}
              className="size-10 rounded-2xl disabled:opacity-40"
              aria-label="ارسال پیام"
            >
              <ArrowUp className="size-4" />
            </ChatbotButton>
          )}
        </div>
      </motion.div>
    </form>
  );
}
