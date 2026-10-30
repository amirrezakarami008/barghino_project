"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/shared/lib/cn";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs parts must be used inside <Tabs>.");
  return ctx;
}

export type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
};

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const baseId = useId();
  const current = value ?? uncontrolled;

  return (
    <TabsContext
      value={{
        value: current,
        setValue: (next) => {
          setUncontrolled(next);
          onValueChange?.(next);
        },
        baseId,
      }}
    >
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext>
  );
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto rounded-md border border-border bg-surface p-1",
        className,
      )}
      {...props}
    />
  );
}

export type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: current, setValue, baseId } = useTabs();
  const selected = current === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      className={cn(
        "min-h-11 shrink-0 rounded-sm px-4 text-sm font-semibold transition-colors duration-fast ease-out",
        selected
          ? "bg-card text-foreground shadow-soft"
          : "text-foreground-muted hover:text-foreground",
        className,
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: current, baseId } = useTabs();
  if (current !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
