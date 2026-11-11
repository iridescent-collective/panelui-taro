import type { QuestionnaireShortcutMode } from "./types";

export const isAnswered = (value: string | string[] | undefined): boolean => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return typeof value === "string" && value.trim().length > 0;
};
export const shortcutAt = (
  mode: QuestionnaireShortcutMode,
  index: number
): string | null => {
  if (mode === "numbers") {
    return index < 9 ? String(index + 1) : null;
  }
  return index < 26 ? String.fromCodePoint(65 + index) : null;
};
