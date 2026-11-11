import type { TagInputProps, TagRejection } from "./types";

export interface MarkedTag {
  index: number;
  tag: string;
}
export const reconcileMarkedTag = (
  marked: MarkedTag | null,
  tags: readonly string[]
): MarkedTag | null =>
  marked && tags[marked.index] === marked.tag ? marked : null;
export const splitOn = (text: string, delimiters: string[]) => {
  let parts = [text];
  for (const delimiter of delimiters) {
    if (delimiter) {
      parts = parts.flatMap((part) => part.split(delimiter));
    }
  }
  return parts;
};
export const addCandidates = (
  candidates: string[],
  tags: string[],
  rules: Pick<
    TagInputProps,
    "allowDuplicates" | "max" | "allowOverflow" | "validate"
  >
) => {
  const next = [...tags];
  const rejected: { tag: string; reason: TagRejection }[] = [];
  for (const tag of candidates.map((entry) => entry.trim()).filter(Boolean)) {
    if (!rules.allowDuplicates && next.includes(tag)) {
      rejected.push({ reason: "duplicate", tag });
      continue;
    }
    if (
      rules.max !== undefined &&
      next.length >= rules.max &&
      !rules.allowOverflow
    ) {
      rejected.push({ reason: "max", tag });
      continue;
    }
    if (rules.validate && !rules.validate(tag, next)) {
      rejected.push({ reason: "invalid", tag });
      continue;
    }
    next.push(tag);
  }
  return { added: next.length > tags.length, next, rejected };
};
