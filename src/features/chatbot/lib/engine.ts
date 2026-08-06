/**
 * Chat engine boundary — swap mode / implementation when AI is ready.
 * UI should only call `requestAssistantReply`.
 */
import {
  buildStubReply,
  createMessageId,
  delay,
} from "@/features/chatbot/constants/data";
import type { ChatEngineMode, ChatMessage } from "@/features/chatbot/types";

export const CHAT_ENGINE_MODE: ChatEngineMode = "stub";

export type AssistantReplyRequest = {
  messages: ChatMessage[];
  userText: string;
  signal?: AbortSignal;
};

export type AssistantReplyResult = {
  message: ChatMessage;
  mode: ChatEngineMode;
};

export async function requestAssistantReply(
  request: AssistantReplyRequest,
): Promise<AssistantReplyResult> {
  if (CHAT_ENGINE_MODE === "ai") {
    throw new Error("AI engine is not connected yet.");
  }

  await delay(900 + Math.floor(Math.random() * 700));

  if (request.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  return {
    mode: "stub",
    message: {
      id: createMessageId(),
      role: "assistant",
      content: buildStubReply(request.userText),
      createdAt: new Date().toISOString(),
      status: "done",
    },
  };
}
