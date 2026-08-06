"use client";

import { useCallback, useRef, useState } from "react";

import { requestAssistantReply } from "@/features/chatbot/lib/engine";
import {
  createMessageId,
  welcomeAssistantMessage,
} from "@/features/chatbot/constants/data";
import type { ChatMessage } from "@/features/chatbot/types";

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeAssistantMessage]);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isThinking) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
        status: "done",
      };

      const thinkingId = createMessageId();
      const thinkingMessage: ChatMessage = {
        id: thinkingId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "streaming",
      };

      setInput("");
      setMessages((prev) => [...prev, userMessage, thinkingMessage]);
      setIsThinking(true);

      try {
        const result = await requestAssistantReply({
          messages: [...messages, userMessage],
          userText: text,
          signal: controller.signal,
        });

        setMessages((prev) =>
          prev.map((message) => (message.id === thinkingId ? result.message : message)),
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setMessages((prev) => prev.filter((message) => message.id !== thinkingId));
          return;
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === thinkingId
              ? {
                  ...message,
                  content:
                    "الان نتوانستم پاسخ بسازم. کمی بعد دوباره امتحان کن — موتور AI هنوز متصل نیست.",
                  status: "error",
                }
              : message,
          ),
        );
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages],
  );

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    setIsThinking(false);
    setMessages([
      {
        ...welcomeAssistantMessage,
        id: createMessageId(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput("");
  }, []);

  const stopThinking = useCallback(() => {
    abortRef.current?.abort();
    setIsThinking(false);
    setMessages((prev) => prev.filter((message) => message.status !== "streaming"));
  }, []);

  return {
    messages,
    input,
    setInput,
    isThinking,
    sendMessage,
    clearConversation,
    stopThinking,
    hasUserMessages: messages.some((message) => message.role === "user"),
  };
}
