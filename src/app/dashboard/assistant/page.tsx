"use client";

import { DashboardPage, Panel, PanelHeader } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import {
  ASSISTANT_SUGGESTIONS,
  answerAssistantQuestion,
  type AssistantMessage,
} from "@/features/dashboard/lib/assistant";
import { Sparkles } from "lucide-react";
import { useState } from "react";

const WELCOME: AssistantMessage = {
  role: "assistant",
  content:
    "من دستیار انرژی برقینو هستم. به‌جای گشتن بین نمودارها، سؤالت را بپرس — درباره تولید، درآمد، سلامت نیروگاه، شستشو یا بورس سبز.",
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME]);
  const [input, setInput] = useState("");

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const answer = answerAssistantQuestion(q);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: answer },
    ]);
    setInput("");
  }

  return (
    <DashboardPage
      title="دستیار هوشمند نیروگاه"
      subtitle="تحلیل ساده تولید، درآمد و سلامت — نسخه rule-based"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Panel className="flex min-h-[520px] flex-col">
          <PanelHeader
            title="گفتگو"
            description="بدون نیاز به خواندن همه نمودارها"
          />

          <div className="mb-4 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-slate-50/80 p-4">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-brand-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      دستیار برقینو
                    </span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="مثلاً: سلامت نیروگاهم چطوره؟"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
            />
            <Button type="submit" size="lg">
              بپرس
            </Button>
          </form>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="پیشنهاد سؤال" />
            <div className="flex flex-col gap-2">
              {ASSISTANT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-right text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                >
                  {s}
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="border-brand-100 bg-brand-50/40">
            <p className="text-sm leading-7 text-slate-600">
              این نسخه با قوانین و دادهٔ فعلی پنل کار می‌کند. بعداً می‌تواند به مدل زبانی و داده زنده وصل شود.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Button href="/dashboard/reports" variant="outline" size="sm" fullWidth>
                گزارش ماهانه
              </Button>
              <Button href="/dashboard/plant" variant="outline" size="sm" fullWidth>
                نیروگاه من
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardPage>
  );
}
