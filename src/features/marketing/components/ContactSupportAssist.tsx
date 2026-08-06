"use client";

import { ChatTypingIndicator } from "@/features/chatbot/components/chat-typing-indicator";
import {
  CONTACT_ASSIST_TOPICS,
  matchContactAssistTopic,
  type ContactAssistTopic,
} from "@/features/marketing/constants/contact-assist";
import { Button } from "@/shared/ui/Button";
import { Bot, Check, Send, Sparkles } from "lucide-react";
import { useState } from "react";

type AssistDraft = {
  subject: string;
  message: string;
  reply: string;
  label: string;
};

type ContactSupportAssistProps = {
  onApply: (draft: { subject: string; message: string }) => void;
};

export function ContactSupportAssist({ onApply }: ContactSupportAssistProps) {
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState<AssistDraft | null>(null);
  const [applied, setApplied] = useState(false);

  async function produceFromTopic(topic: ContactAssistTopic) {
    setThinking(true);
    setApplied(false);
    setDraft(null);
    await new Promise((r) => setTimeout(r, 550 + Math.random() * 400));
    setDraft({
      subject: topic.subject,
      message: topic.message,
      reply: topic.reply,
      label: topic.label,
    });
    setThinking(false);
  }

  async function handleTopicClick(topic: ContactAssistTopic) {
    setInput(topic.promptHint);
    await produceFromTopic(topic);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    await produceFromTopic(matchContactAssistTopic(text));
  }

  function handleApply() {
    if (!draft) return;
    onApply({ subject: draft.subject, message: draft.message });
    setApplied(true);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200/70 bg-gradient-to-b from-brand-50/80 to-white shadow-sm shadow-brand-500/5">
      <div className="flex items-center gap-3 border-b border-brand-100/80 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/25">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">دستیار متن پیام</p>
          <p className="text-[11px] text-slate-500">موضوع را بگو؛ متن آماده می‌سازم تا یک‌کلیکه بفرستی</p>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-brand-700 ring-1 ring-brand-100 sm:inline-flex">
          <Sparkles className="h-3 w-3" />
          پشتیبانی سریع
        </span>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-xs leading-5 text-slate-600">
          موضوع رایج را انتخاب کن یا خودت بنویس — متن تماس را آماده می‌کنم.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {CONTACT_ASSIST_TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              disabled={thinking}
              onClick={() => handleTopicClick(topic)}
              className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-brand-50 hover:text-brand-800 hover:ring-brand-200 disabled:opacity-50"
            >
              {topic.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثلاً: می‌خوام نیروگاه نصب کنم..."
            disabled={thinking}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
            aria-label="ساخت متن"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {thinking && (
          <ChatTypingIndicator label="در حال آماده‌کردن متن پیام…" />
        )}

        {draft && !thinking && (
          <div className="animate-fade-up space-y-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs leading-5 text-slate-600">{draft.reply}</p>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-6 text-slate-700 ring-1 ring-slate-100 whitespace-pre-wrap">
              {draft.message}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" onClick={handleApply}>
                {applied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    درج شد در فرم
                  </>
                ) : (
                  "استفاده از این متن در فرم"
                )}
              </Button>
              <span className="text-[10px] text-slate-400">موضوع فرم هم تنظیم می‌شود</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
