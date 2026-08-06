export type ChatRole = "user" | "assistant" | "system";

export type ChatMessageStatus = "sending" | "streaming" | "done" | "error";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  status?: ChatMessageStatus;
};

export type ChatSuggestionIcon =
  | "health"
  | "income"
  | "compare"
  | "rate"
  | "wash"
  | "alert";

export type ChatSuggestion = {
  id: string;
  label: string;
  prompt: string;
  icon: ChatSuggestionIcon;
};

export type ChatConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
};

/** Swap this when wiring a real AI backend. */
export type ChatEngineMode = "stub" | "ai";
