"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

import { ChatTypingIndicator } from "@/features/chatbot/components/chat-typing-indicator";
import type { ChatMessage } from "@/features/chatbot/types";
import { cn } from "@/shared/lib/utils";

type ChatMessageBubbleProps = {
  message: ChatMessage;
  index: number;
};

export function ChatMessageBubble({ message, index }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.2) }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "mt-1 flex size-9 shrink-0 items-center justify-center rounded-2xl border",
          isUser
            ? "border-slate-200 bg-slate-100 text-slate-600"
            : "border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 text-brand-600 shadow-sm shadow-brand-500/10",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div className={cn("max-w-[min(100%,42rem)] space-y-2", isUser ? "items-end text-start" : "items-start")}>
        <div
          className={cn(
            "rounded-[1.35rem] px-4 py-3 text-sm leading-7 whitespace-pre-wrap",
            isUser
              ? "rounded-tr-md bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : isError
                ? "border border-rose-200 bg-rose-50 text-rose-700"
                : "border border-slate-200/80 bg-slate-50 text-slate-800",
          )}
        >
          {isStreaming ? <ChatTypingIndicator /> : message.content}
        </div>

        {!isStreaming ? (
          <p className={cn("px-1 text-[11px] text-slate-400", isUser && "text-end")}>
            {formatTime(message.createdAt)}
            {!isUser && message.status === "done" ? " · آزمایشی" : null}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
