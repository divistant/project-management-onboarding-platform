import { useI18nStore } from "./index";

/**
 * Hook to get the translation function.
 * Usage: const t = useT();  →  t('nav_dashboard') // "Dashboard" or "Dashboard"
 */
export function useT() {
    return useI18nStore((s) => s.t);
}

export { useI18nStore };
export type { Locale } from "./index";
