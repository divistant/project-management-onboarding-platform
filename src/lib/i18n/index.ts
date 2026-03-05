import { create } from "zustand";
import { en, type TranslationKey } from "./translations/en";
import { id } from "./translations/id";

export type Locale = "en" | "id";

const translations: Record<Locale, Record<TranslationKey, string>> = { en, id };

interface I18nState {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey) => string;
}

const stored =
    typeof window !== "undefined"
        ? (localStorage.getItem("pm-locale") as Locale | null)
        : null;
const initialLocale: Locale = stored ?? "id";

export const useI18nStore = create<I18nState>((set, get) => ({
    locale: initialLocale,
    setLocale: (locale) => {
        if (typeof window !== "undefined") localStorage.setItem("pm-locale", locale);
        set({ locale });
    },
    t: (key) => {
        const dict = translations[get().locale];
        return dict[key] ?? translations.en[key] ?? key;
    },
}));
