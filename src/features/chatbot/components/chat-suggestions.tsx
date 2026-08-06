"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Droplets,
  LineChart,
  Scale,
  ShieldCheck,
  Sun,
} from "lucide-react";

import { chatSuggestions } from "@/features/chatbot/constants/data";
import type { ChatSuggestion, ChatSuggestionIcon } from "@/features/chatbot/types";
import { cn } from "@/shared/lib/utils";

const iconMap: Record<ChatSuggestionIcon, typeof Sun> = {
  health: ShieldCheck,
  income: LineChart,
  compare: Scale,
  rate: Sun,
  wash: Droplets,
  alert: AlertTriangle,
};

type ChatSuggestionsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function ChatSuggestions({ onSelect, disabled, compact }: ChatSuggestionsProps) {
  const items = compact ? chatSuggestions.slice(0, 4) : chatSuggestions;

  return (
    <div
      className={cn(
        "grid gap-2.5",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {items.map((item, index) => (
        <SuggestionChip
          key={item.id}
          item={item}
          index={index}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function SuggestionChip({
  item,
  index,
  disabled,
  onSelect,
}: {
  item: ChatSuggestion;
  index: number;
  disabled?: boolean;
  onSelect: (prompt: string) => void;
}) {
  const Icon = iconMap[item.icon];

  return (
    <motion.button
      type="button"
      disabled={disabled}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.05 }}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={() => onSelect(item.prompt)}
      className={cn(
        "group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-start shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50/60",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600 transition group-hover:border-brand-200 group-hover:bg-brand-100">
        <Icon className="size-4" />
      </span>
      <span className="text-sm leading-6 text-slate-700">{item.label}</span>
    </motion.button>
  );
}
