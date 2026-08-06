import { ChatbotPage } from "@/features/chatbot";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "دستیار هوشمند" };

export default function AssistantPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 pb-24 sm:p-5 lg:p-6 lg:pb-6">
      <ChatbotPage />
    </main>
  );
}
