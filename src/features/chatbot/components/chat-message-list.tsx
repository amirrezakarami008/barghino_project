"use client";

import { useEffect, useRef } from "react";

import { ChatMessageBubble } from "@/features/chatbot/components/chat-message-bubble";
import type { ChatMessage } from "@/features/chatbot/types";

type ChatMessageListProps = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="scrollbar-brand flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
      {messages.map((message, index) => (
        <ChatMessageBubble key={message.id} message={message} index={index} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
