import type { ReactNode } from "react";

export const COUNT_DURATION = 160;
export const POP = { damping: 12, mass: 0.4, stiffness: 320 } as const;
export const isType = (child: ReactNode, type: unknown): boolean =>
  typeof child === "object" &&
  child !== null &&
  "type" in child &&
  (
    child as {
      type?: unknown;
    }
  ).type === type;

export const initials = (name: string): string =>
  name
    .split(/\s+/u)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();

export interface Token {
  kind: "text" | "tag" | "mention";
  value: string;
}
export const tokenize = (text: string): Token[] => {
  const pattern = /[#@][\w-]+/gu;
  const tokens: Token[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) {
      tokens.push({ kind: "text", value: text.slice(last, start) });
    }
    tokens.push({
      kind: match[0].startsWith("#") ? "tag" : "mention",
      value: match[0],
    });
    last = start + match[0].length;
  }
  if (last < text.length) {
    tokens.push({ kind: "text", value: text.slice(last) });
  }
  return tokens;
};
export const SCRIM_COLOURS: readonly [string, string, string] = [
  "rgba(0,0,0,0.55)",
  "rgba(0,0,0,0.28)",
  "rgba(0,0,0,0)",
];
export const statTone: Record<"default" | "like" | "save" | "repost", string> =
  {
    default: "primary",
    like: "destructive",
    repost: "success",
    save: "primary",
  };
export const numeric = (value: ReactNode): number | null => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const parsed = Number(value.replaceAll(/[,\s]/gu, ""));
  return Number.isFinite(parsed) ? parsed : null;
};
