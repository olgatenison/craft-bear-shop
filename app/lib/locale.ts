// app/lib/locale.ts
export const LOCALES = ["en", "et", "fi", "uk", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
