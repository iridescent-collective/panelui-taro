export interface EditorSelection {
  start: number;
  end: number;
}
export interface EditResult {
  text: string;
  selection: EditorSelection;
}
const normalise = (
  text: string,
  selection: EditorSelection
): EditorSelection => {
  const a = Math.max(0, Math.min(text.length, selection.start));
  const b = Math.max(0, Math.min(text.length, selection.end));
  return { end: Math.max(a, b), start: Math.min(a, b) };
};
export const toggleWrap = (
  text: string,
  selection: EditorSelection,
  marker: string
): EditResult => {
  const { start, end } = normalise(text, selection);
  const selected = text.slice(start, end);
  const len = marker.length;
  if (
    selected.length >= len * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    const inner = selected.slice(len, selected.length - len);
    return {
      selection: { end: start + inner.length, start },
      text: text.slice(0, start) + inner + text.slice(end),
    };
  }
  const before = text.slice(Math.max(0, start - len), start);
  const after = text.slice(end, end + len);
  if (before === marker && after === marker) {
    return {
      selection: { end: end - len, start: start - len },
      text: text.slice(0, start - len) + selected + text.slice(end + len),
    };
  }
  if (selected.includes("\n")) {
    const wrapped = selected
      .split("\n")
      .map((line) => (line.trim() === "" ? line : marker + line + marker))
      .join("\n");
    const next = text.slice(0, start) + wrapped + text.slice(end);
    return { selection: { end: start + wrapped.length, start }, text: next };
  }
  const next =
    text.slice(0, start) + marker + selected + marker + text.slice(end);
  return selected
    ? { selection: { end: end + len, start: start + len }, text: next }
    : { selection: { end: start + len, start: start + len }, text: next };
};
const lineRange = (
  text: string,
  selection: EditorSelection
): EditorSelection => {
  const { start, end } = normalise(text, selection);
  const from = text.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = text.indexOf("\n", end);
  return { end: lineEnd === -1 ? text.length : lineEnd, start: from };
};
const replaceBlock = (
  text: string,
  range: EditorSelection,
  replacement: string
): EditResult => ({
  selection: { end: range.start + replacement.length, start: range.start },
  text: text.slice(0, range.start) + replacement + text.slice(range.end),
});
const replaceBlockKeepingCaret = (
  text: string,
  range: EditorSelection,
  replacement: string,
  selection: EditorSelection
): EditResult => {
  const next = text.slice(0, range.start) + replacement + text.slice(range.end);
  const { start, end } = normalise(text, selection);
  if (start !== end) {
    return {
      selection: { end: range.start + replacement.length, start: range.start },
      text: next,
    };
  }
  const before = text.slice(range.start, start);
  const line = before.split("\n").length - 1;
  const column = before.length - (before.lastIndexOf("\n") + 1);
  const oldLines = text.slice(range.start, range.end).split("\n");
  const newLines = replacement.split("\n");
  const index = Math.min(line, newLines.length - 1);
  const oldLine = oldLines[Math.min(line, oldLines.length - 1)] ?? "";
  const newLine = newLines[index] ?? "";
  const fromEnd = Math.max(0, oldLine.length - column);
  const nextColumn = Math.max(0, newLine.length - fromEnd);
  const offsetToLine = newLines
    .slice(0, index)
    .reduce((total, each) => total + each.length + 1, 0);
  const at = range.start + offsetToLine + Math.min(nextColumn, newLine.length);
  return { selection: { end: at, start: at }, text: next };
};
export const toggleLinePrefix = (
  text: string,
  selection: EditorSelection,
  prefix: string
): EditResult => {
  const range = lineRange(text, selection);
  const lines = text.slice(range.start, range.end).split("\n");
  const has = (line: string) => line.startsWith(prefix);
  const next = lines.every(has)
    ? lines.map((line) => line.slice(prefix.length))
    : lines.map((line) => (has(line) ? line : prefix + line));
  return replaceBlockKeepingCaret(text, range, next.join("\n"), selection);
};
const ORDERED = /^\d+\.\s/u;
export const toggleOrderedList = (
  text: string,
  selection: EditorSelection
): EditResult => {
  const range = lineRange(text, selection);
  const lines = text.slice(range.start, range.end).split("\n");
  const next = lines.every((line) => ORDERED.test(line))
    ? lines.map((line) => line.replace(ORDERED, ""))
    : lines.map((line, i) => `${i + 1}. ${line.replace(ORDERED, "")}`);
  return replaceBlockKeepingCaret(text, range, next.join("\n"), selection);
};
export const LINK_PLACEHOLDER = "url";
export const insertLink = (
  text: string,
  selection: EditorSelection
): EditResult => {
  const { start, end } = normalise(text, selection);
  const label = text.slice(start, end);
  const inserted = `[${label}](${LINK_PLACEHOLDER})`;
  const next = text.slice(0, start) + inserted + text.slice(end);
  if (label) {
    const from = start + label.length + 3;
    return {
      selection: { end: from + LINK_PLACEHOLDER.length, start: from },
      text: next,
    };
  }
  return { selection: { end: start + 1, start: start + 1 }, text: next };
};
const enclosingFence = (
  text: string,
  selection: EditorSelection
): EditorSelection | null => {
  const { start, end } = normalise(text, selection);
  let offset = 0;
  let openedAt: number | null = null;
  for (const line of text.split("\n")) {
    const lineStart = offset;
    const lineEnd = offset + line.length;
    if (line.startsWith("```")) {
      if (openedAt === null) {
        openedAt = lineStart;
      } else {
        if (start >= openedAt && end <= lineEnd) {
          return { end: lineEnd, start: openedAt };
        }
        openedAt = null;
      }
    }
    offset = lineEnd + 1;
  }
  return null;
};
export const toggleFence = (
  text: string,
  selection: EditorSelection
): EditResult => {
  const enclosing = enclosingFence(text, selection);
  if (enclosing) {
    const inner = text
      .slice(enclosing.start, enclosing.end)
      .split("\n")
      .slice(1, -1)
      .join("\n");
    return replaceBlock(text, enclosing, inner);
  }
  const range = lineRange(text, selection);
  const block = text.slice(range.start, range.end);
  const leadIn = range.start > 0 && text[range.start - 1] !== "\n" ? "\n" : "";
  const rest = text.slice(range.end);
  const leadOut = rest === "" || rest.startsWith("\n\n") ? "" : "\n";
  const opener = `${leadIn}\`\`\`\n`;
  const fenced = `${opener}${block}\n\`\`\`${leadOut}`;
  const result = replaceBlock(text, range, fenced);
  const inner = range.start + opener.length;
  return {
    selection: { end: inner + block.length, start: inner },
    text: result.text,
  };
};
export const IMAGE_PLACEHOLDER = "description";
export const insertImage = (
  text: string,
  selection: EditorSelection
): EditResult => {
  const { start, end } = normalise(text, selection);
  const label = text.slice(start, end);
  const alt = label || IMAGE_PLACEHOLDER;
  const inserted = `![${alt}](${LINK_PLACEHOLDER})`;
  const next = text.slice(0, start) + inserted + text.slice(end);
  if (label) {
    const from = start + label.length + 4;
    return {
      selection: { end: from + LINK_PLACEHOLDER.length, start: from },
      text: next,
    };
  }
  const from = start + 2;
  return { selection: { end: from + alt.length, start: from }, text: next };
};
const LINE_INDENT = /^\s*/u;
const LINE_MARKER = /^(?:\d+\.|[-*+])/u;
const LINE_GAP = /^\s+/u;
const BULLET = /^\s*[-*+]\s+.*$/u;
const NUMBERED = /^\s*\d+\.\s+.*$/u;
export const continueList = (
  text: string,
  selection: EditorSelection
): EditResult | null => {
  const { start, end } = normalise(text, selection);
  if (start !== end) {
    return null;
  }
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const line = text.slice(lineStart, start);
  const bullet = BULLET.test(line);
  const numbered = !bullet && NUMBERED.test(line);
  if (!bullet && !numbered) {
    return null;
  }
  const indent = LINE_INDENT.exec(line)?.[0] ?? "";
  const rest = line.slice(indent.length);
  const prefix = LINE_MARKER.exec(rest)?.[0] ?? "";
  const marker = numbered ? prefix.slice(0, -1) : prefix;
  const afterMarker = rest.slice(prefix.length);
  const gap = LINE_GAP.exec(afterMarker)?.[0] ?? " ";
  const content = afterMarker.slice(gap.length);
  if (content.trim() === "") {
    const next = text.slice(0, lineStart) + text.slice(start);
    return { selection: { end: lineStart, start: lineStart }, text: next };
  }
  const opener = numbered
    ? `${indent}${Number(marker) + 1}.${gap}`
    : `${indent}${marker}${gap}`;
  const inserted = `\n${opener}`;
  const next = text.slice(0, start) + inserted + text.slice(start);
  const at = start + inserted.length;
  return { selection: { end: at, start: at }, text: next };
};
export const hasWrap = (
  text: string,
  selection: EditorSelection,
  marker: string
): boolean => {
  const { start, end } = normalise(text, selection);
  const selected = text.slice(start, end);
  const len = marker.length;
  if (
    selected.length >= len * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    return true;
  }
  return (
    text.slice(Math.max(0, start - len), start) === marker &&
    text.slice(end, end + len) === marker
  );
};
export const hasLinePrefix = (
  text: string,
  selection: EditorSelection,
  prefix: string
): boolean => {
  const range = lineRange(text, selection);
  return text
    .slice(range.start, range.end)
    .split("\n")
    .every((line) => line.startsWith(prefix));
};
export const hasOrderedList = (
  text: string,
  selection: EditorSelection
): boolean => {
  const range = lineRange(text, selection);
  return text
    .slice(range.start, range.end)
    .split("\n")
    .every((line) => ORDERED.test(line));
};
export const hasFence = (text: string, selection: EditorSelection): boolean =>
  enclosingFence(text, selection) !== null;
