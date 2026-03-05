import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const resolved = getResolvedTheme(theme);
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

const stored = typeof window !== "undefined" ? (localStorage.getItem("pm-theme") as Theme | null) : null;
const initialTheme: Theme = stored ?? "system";

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  resolvedTheme: getResolvedTheme(initialTheme),
  setTheme: (theme) => {
    localStorage.setItem("pm-theme", theme);
    applyTheme(theme);
    set({ theme, resolvedTheme: getResolvedTheme(theme) });
  },
}));
