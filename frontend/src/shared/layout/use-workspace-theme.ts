"use client";

import { useSyncExternalStore } from "react";
import type { WorkspaceTheme } from "./workspace-types";

const themeEvent = "barghino-theme-change";

function readTheme(themeCookie: string, fallback: WorkspaceTheme): WorkspaceTheme {
  const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(`${themeCookie}=`));
  const stored = cookie?.split("=")[1];
  return stored === "dark" || stored === "light" ? stored : fallback;
}

function subscribeTheme(onChange: () => void) {
  window.addEventListener(themeEvent, onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener(themeEvent, onChange);
    window.removeEventListener("focus", onChange);
  };
}

export function useWorkspaceTheme(initialTheme: WorkspaceTheme, themeCookie = "barghino-theme"): {
  theme: WorkspaceTheme;
  toggleTheme: () => void;
} {
  const theme = useSyncExternalStore(subscribeTheme, () => readTheme(themeCookie, initialTheme), () => initialTheme);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.cookie = `${themeCookie}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event(themeEvent));
  }

  return { theme, toggleTheme };
}
