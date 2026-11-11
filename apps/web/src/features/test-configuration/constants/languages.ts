// ISO 639-1 codes. Malay is "ms" ("bm" is Bambara).
export type LanguageCode = "en" | "ms" | "zh";

export const LANGUAGE_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ms", label: "Bahasa Melayu" },
  { value: "zh", label: "Chinese" },
];
