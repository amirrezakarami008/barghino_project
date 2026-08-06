import { answerAssistantQuestion } from "@/features/dashboard/lib/assistant";
import type { ChatMessage, ChatSuggestion } from "@/features/chatbot/types";

export const chatbotBrand = {
  name: "دستیار برقینو",
  tagline: "دستیار هوشمند نیروگاه خانگی",
  eyebrow: "Barghino Assistant",
} as const;

export const chatSuggestions: ChatSuggestion[] = [
  {
    id: "s1",
    label: "سلامت نیروگاهم چطوره؟",
    prompt: "سلامت نیروگاهم چطوره؟",
    icon: "health",
  },
  {
    id: "s2",
    label: "درآمد ماه آینده چقدر است؟",
    prompt: "درآمد ماه آینده چقدر است؟",
    icon: "income",
  },
  {
    id: "s3",
    label: "اگر به دولت می‌فروختم؟",
    prompt: "اگر به دولت می‌فروختم چقدر می‌گرفتم؟",
    icon: "compare",
  },
  {
    id: "s4",
    label: "نرخ بورس سبز چقدر است؟",
    prompt: "نرخ بورس سبز چقدر است؟",
    icon: "rate",
  },
  {
    id: "s5",
    label: "نیاز به شستشو دارم؟",
    prompt: "نیاز به شستشو دارم؟",
    icon: "wash",
  },
  {
    id: "s6",
    label: "هشدارهای نگهداری",
    prompt: "هشدارهای نگهداری و سرویس فعلی چیست؟",
    icon: "alert",
  },
];

export const welcomeAssistantMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "سلام — من دستیار هوشمند برقینو هستم.\n\nدرباره تولید، درآمد، سلامت نیروگاه، شستشو، بورس سبز یا مقایسه با فروش به دولت از من بپرس. فعلاً در حالت آزمایشی کار می‌کنم و به‌زودی به هوش مصنوعی متصل می‌شوم.",
  createdAt: new Date(0).toISOString(),
  status: "done",
};

export function buildStubReply(userText: string): string {
  return answerAssistantQuestion(userText);
}

export function createMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
