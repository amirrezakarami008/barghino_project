"use client";

import { motion } from "framer-motion";
import { Bot, Eraser, Radio, Sparkles } from "lucide-react";

import { ChatComposer } from "@/features/chatbot/components/chat-composer";
import { ChatMessageList } from "@/features/chatbot/components/chat-message-list";
import { ChatSuggestions } from "@/features/chatbot/components/chat-suggestions";
import { ChatWelcome } from "@/features/chatbot/components/chat-welcome";
import { ChatbotButton } from "@/features/chatbot/components/chatbot-button";
import { chatbotBrand } from "@/features/chatbot/constants/data";
import { useChatbot } from "@/features/chatbot/hooks/use-chatbot";
import { cn } from "@/shared/lib/utils";

export function ChatbotPage() {
  const {
    messages,
    input,
    setInput,
    isThinking,
    sendMessage,
    clearConversation,
    stopThinking,
    hasUserMessages,
  } = useChatbot();

  return (
    <div className="chatbot-shell relative flex min-h-[calc(100svh-6rem)] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[var(--shadow-panel)] sm:min-h-[calc(100svh-5rem)]">
      <div className="chatbot-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-50 via-brand-50/40 to-transparent" />
      <div className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-brand-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -start-16 bottom-20 size-64 rounded-full bg-emerald-100/50 blur-3xl" />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3.5 backdrop-blur-sm sm:px-5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgb(16 185 129 / 0.0)",
                "0 0 24px 0 rgb(16 185 129 / 0.22)",
                "0 0 0 0 rgb(16 185 129 / 0.0)",
              ],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex size-11 items-center justify-center rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 text-brand-600"
          >
            <Bot className="size-5" />
          </motion.div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {chatbotBrand.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-700">
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/70" />
                  <span className="relative size-1.5 rounded-full bg-brand-500" />
                </span>
                آماده‌سازی AI
              </span>
            </div>
            <p className="text-xs text-slate-500 sm:text-sm">
              {chatbotBrand.tagline} · پاسخ‌ها فعلاً آزمایشی‌اند
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:inline-flex">
            <Radio className="size-3.5 text-brand-500" />
            موتور stub فعال
          </span>
          <ChatbotButton
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={clearConversation}
            disabled={isThinking}
          >
            <Eraser className="size-3.5" />
            گفتگوی جدید
          </ChatbotButton>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {!hasUserMessages ? (
          <ChatWelcome onSelect={sendMessage} disabled={isThinking} />
        ) : (
          <>
            <ChatMessageList messages={messages} />
            <div className="border-t border-slate-100 px-4 pt-3 sm:px-6">
              <ChatSuggestions compact onSelect={sendMessage} disabled={isThinking} />
            </div>
          </>
        )}

        <div
          className={cn(
            "relative z-10 mt-auto space-y-2 px-4 pt-4 pb-4 sm:px-6",
            hasUserMessages && "border-t border-slate-100",
          )}
        >
          <ChatComposer
            value={input}
            onChange={setInput}
            onSubmit={sendMessage}
            onStop={stopThinking}
            isThinking={isThinking}
          />
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <Sparkles className="size-3 text-brand-500/70" />
            طراحی‌شده برای اتصال آینده به هوش مصنوعی — فعلاً پاسخ‌ها شبیه‌سازی شده‌اند
          </p>
        </div>
      </div>
    </div>
  );
}
