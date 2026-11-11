export type Align = "left" | "center" | "right";
export interface InlineToken {
  kind: "text" | "code" | "link" | "image";
  value: string;
  href?: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
}
export type Block =
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      inline: InlineToken[];
    }
  | {
      type: "paragraph";
      inline: InlineToken[];
    }
  | {
      type: "code";
      code: string;
      language?: string;
      open: boolean;
    }
  | {
      type: "quote";
      blocks: Block[];
    }
  | {
      type: "list";
      ordered: boolean;
      start: number;
      items: Block[][];
    }
  | {
      type: "table";
      head: InlineToken[][];
      rows: InlineToken[][][];
      align: (Align | null)[];
    }
  | {
      type: "rule";
    };
const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^`\s]*)/u;
const HEADING = /^ {0,3}(#{1,6})\s+(.*)$/u;
const RULE = /^ {0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/u;
const QUOTE = /^ {0,3}> ?(.*)$/u;
const BULLET = /^(\s*)([-*+])\s+(.*)$/u;
const ORDERED = /^(\s*)(\d{1,9})[.)]\s+(.*)$/u;
const TABLE_DIVIDER = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/u;
export function parseMarkdown(source: string, streaming = false): Block[] {
  const lines = source.replaceAll(/\r\n?/gu, "\n").split("\n");
  return parseBlocks(lines, streaming);
}
interface BlockRead {
  blocks: Block[];
  next: number;
}
function readFence(
  lines: string[],
  start: number,
  fence: RegExpExecArray,
  streaming: boolean
): BlockRead {
  const blocks: Block[] = [];
  const line = lines[start];
  let index = start;
  const [, marker] = fence;
  const language = fence[2] || undefined;
  const body: string[] = [];
  let closed = false;
  index += 1;
  while (index < lines.length) {
    const current = lines[index];
    if (
      current.trimStart().startsWith(marker[0].repeat(marker.length)) &&
      !current.trim().slice(marker.length).trim()
    ) {
      closed = true;
      index += 1;
      break;
    }
    body.push(current);
    index += 1;
  }
  if (!closed && !streaming) {
    blocks.push({ inline: parseInline(line, false), type: "paragraph" });
    for (const text of body) {
      if (text.trim()) {
        blocks.push({
          inline: parseInline(text, false),
          type: "paragraph",
        });
      }
    }
    return { blocks, next: index };
  }
  blocks.push({
    code: body.join("\n"),
    language,
    open: !closed,
    type: "code",
  });
  return { blocks, next: index };
}
function paragraphBoundary(
  line: string,
  index: number,
  bodyLength: number
): boolean {
  return (
    index > 0 &&
    bodyLength > 0 &&
    (FENCE.test(line) ||
      HEADING.test(line) ||
      RULE.test(line) ||
      QUOTE.test(line) ||
      BULLET.test(line) ||
      ORDERED.test(line))
  );
}
const MAX_MARKDOWN_DEPTH = 64;
function parseBlocks(lines: string[], streaming: boolean, depth = 0): Block[] {
  if (depth >= MAX_MARKDOWN_DEPTH) {
    return lines
      .filter((line) => line.trim())
      .map((line) => ({ inline: parseInline(line, false), type: "paragraph" }));
  }
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const read = readFence(lines, index, fence, streaming);
      blocks.push(...read.blocks);
      index = read.next;
      continue;
    }
    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({
        inline: parseInline(
          heading[2].replace(/\s+#+\s*$/u, ""),
          streaming && index === lines.length - 1
        ),
        level,
        type: "heading",
      });
      index += 1;
      continue;
    }
    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (index < lines.length) {
        const match = QUOTE.exec(lines[index]);
        if (!match) {
          break;
        }
        body.push(match[1]);
        index += 1;
      }
      blocks.push({
        blocks: parseBlocks(body, streaming, depth + 1),
        type: "quote",
      });
      continue;
    }
    const table = parseTable(lines, index, streaming);
    if (table) {
      blocks.push(table.block);
      index = table.next;
      continue;
    }
    if (BULLET.test(line) || ORDERED.test(line)) {
      const list = parseList(lines, index, streaming, depth);
      blocks.push(list.block);
      index = list.next;
      continue;
    }
    const body: string[] = [];
    while (index < lines.length) {
      const current = lines[index];
      if (!current.trim()) {
        break;
      }
      if (paragraphBoundary(current, index, body.length)) {
        break;
      }
      body.push(current.trim());
      index += 1;
    }
    blocks.push({
      inline: parseInline(body.join(" "), streaming && index >= lines.length),
      type: "paragraph",
    });
  }
  return blocks;
}
function parseTable(
  lines: string[],
  start: number,
  streaming: boolean
): {
  block: Block;
  next: number;
} | null {
  const header = lines[start];
  const divider = lines[start + 1];
  if (!header || !divider) {
    return null;
  }
  if (!header.includes("|")) {
    return null;
  }
  if (!TABLE_DIVIDER.test(divider)) {
    return null;
  }
  const head = splitRow(header).map((cell) => parseInline(cell, false));
  const align = splitRow(divider).map((cell): Align | null => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) {
      return "center";
    }
    if (right) {
      return "right";
    }
    if (left) {
      return "left";
    }
    return null;
  });
  const rows: InlineToken[][][] = [];
  let index = start + 2;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim() || !line.includes("|")) {
      break;
    }
    const partial = streaming && index === lines.length - 1;
    if (partial) {
      index += 1;
      break;
    }
    rows.push(splitRow(line).map((cell) => parseInline(cell, false)));
    index += 1;
  }
  return { block: { align, head, rows, type: "table" }, next: index };
}
function splitRow(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/u, "")
    .replace(/\|$/u, "")
    .split("|")
    .map((cell) => cell.trim());
}
function parseList(
  lines: string[],
  start: number,
  streaming: boolean,
  depth: number
): {
  block: Block;
  next: number;
} {
  const first = BULLET.exec(lines[start]) ?? ORDERED.exec(lines[start]);
  const ordered = !BULLET.test(lines[start]);
  if (!first) {
    throw new Error("List reader requires a list item");
  }
  const baseIndent = first[1].length;
  const startNumber = ordered ? Number(first[2]) : 1;
  const items: string[][] = [];
  let current: string[] | null = null;
  let index = start;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      const next = lines[index + 1];
      if (
        next &&
        next.trim() &&
        leadingSpaces(next) <= baseIndent &&
        !isItem(next)
      ) {
        break;
      }
      if (current) {
        current.push("");
      }
      index += 1;
      continue;
    }
    const item = BULLET.exec(line) ?? ORDERED.exec(line);
    if (item && item[1].length <= baseIndent) {
      if (ordered !== !BULLET.test(line)) {
        break;
      }
      current = [item[3]];
      items.push(current);
      index += 1;
      continue;
    }
    if (leadingSpaces(line) > baseIndent && current) {
      current.push(line.slice(baseIndent + 1));
      index += 1;
      continue;
    }
    break;
  }
  return {
    block: {
      items: items.map((body, position) =>
        parseBlocks(body, streaming && position === items.length - 1, depth + 1)
      ),
      ordered,
      start: Number.isFinite(startNumber) ? startNumber : 1,
      type: "list",
    },
    next: index,
  };
}
function isItem(line: string): boolean {
  return BULLET.test(line) || ORDERED.test(line);
}
function leadingSpaces(line: string): number {
  return line.length - line.trimStart().length;
}
interface Marks {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
}
function escapedCharacter(rest: string): string | undefined {
  return rest[0] === "\\" && rest.length > 1 ? rest[1] : undefined;
}
function clearMark(marks: Marks, key: keyof Marks): void {
  if (key === "bold") {
    delete marks.bold;
  } else if (key === "italic") {
    delete marks.italic;
  } else {
    delete marks.strike;
  }
}
function codeRun(rest: string): string {
  return /^(`+)/u.exec(rest)?.[1] ?? "`";
}
export function parseInline(source: string, tail: boolean): InlineToken[] {
  const tokens: InlineToken[] = [];
  let buffer = "";
  let index = 0;
  const marks: Marks = {};
  const flush = () => {
    if (!buffer) {
      return;
    }
    tokens.push({ kind: "text", value: buffer, ...marks });
    buffer = "";
  };
  while (index < source.length) {
    const rest = source.slice(index);
    const escaped = escapedCharacter(rest);
    if (escaped !== undefined) {
      buffer += escaped;
      index += 2;
      continue;
    }
    if (rest[0] === "`") {
      const run = codeRun(rest);
      const closer = source.indexOf(run, index + run.length);
      if (closer !== -1) {
        flush();
        tokens.push({
          kind: "code",
          value: source.slice(index + run.length, closer),
          ...marks,
        });
        index = closer + run.length;
        continue;
      }
      if (tail) {
        flush();
        const value = source.slice(index + run.length);
        if (value) {
          tokens.push({ kind: "code", value, ...marks });
        }
        index = source.length;
        continue;
      }
      buffer += run;
      index += run.length;
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)\s]*)[^)]*\)/u.exec(rest);
    if (image) {
      flush();
      tokens.push({ href: image[2], kind: "image", value: image[1] });
      index += image[0].length;
      continue;
    }
    const link = /^\[([^\]]*)\]\(([^)\s]*)[^)]*\)/u.exec(rest);
    if (link) {
      flush();
      tokens.push({ href: link[2], kind: "link", value: link[1], ...marks });
      index += link[0].length;
      continue;
    }
    if (tail) {
      const partialLink = /^\[([^\]]*)\](\([^)]*)?$/u.exec(rest);
      if (partialLink) {
        flush();
        if (partialLink[1]) {
          tokens.push({ kind: "text", value: partialLink[1], ...marks });
        }
        index = source.length;
        continue;
      }
    }
    const emphasis = /^(\*\*\*|___|\*\*|__|~~|\*|_)/u.exec(rest);
    if (emphasis) {
      const [, marker] = emphasis;
      const applied = markFor(marker);
      const open = Object.keys(applied).every(
        (key) => marks[key as keyof Marks]
      );
      if (open) {
        flush();
        for (const key of Object.keys(applied)) {
          clearMark(marks, key as keyof Marks);
        }
        index += marker.length;
        continue;
      }
      const after = source[index + marker.length];
      if (after === undefined || /\s/u.test(after)) {
        buffer += marker;
        index += marker.length;
        continue;
      }
      const closer = source.indexOf(marker, index + marker.length);
      if (closer !== -1) {
        flush();
        Object.assign(marks, applied);
        index += marker.length;
        continue;
      }
      if (tail && index + marker.length < source.length) {
        flush();
        Object.assign(marks, applied);
        index += marker.length;
        continue;
      }
      buffer += marker;
      index += marker.length;
      continue;
    }
    buffer += rest[0];
    index += 1;
  }
  flush();
  return tokens;
}
function markFor(marker: string): Marks {
  switch (marker) {
    case "***":
    case "___": {
      return { bold: true, italic: true };
    }
    case "**":
    case "__": {
      return { bold: true };
    }
    case "~~": {
      return { strike: true };
    }
    default: {
      return { italic: true };
    }
  }
}
