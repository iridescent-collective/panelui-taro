export type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error";
export type ChatEvent =
  | { type: "text"; delta: string }
  | { type: "reasoning"; delta: string }
  | {
      type: "tool";
      id: string;
      name: string;
      state: ToolState;
      input?: string;
      output?: string;
      error?: string;
    }
  | { type: "source"; id: string; url: string; title: string }
  | { type: "finish" }
  | { type: "error"; message: string };
export interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
}
export interface ChatTransport {
  (
    body: ChatRequest,
    onEvent: (event: ChatEvent) => void,
    onError: (error: Error) => void
  ): () => void;
}
const MAX_LINE = 262144;
function event(value: unknown): ChatEvent {
  if (!value || typeof value !== "object")
    throw new Error("Invalid stream event");
  const v = value as Record<string, unknown>;
  const strings = (...keys: string[]) =>
    keys.every((key) => typeof v[key] === "string");
  if (v.type === "finish") return { type: "finish" };
  if ((v.type === "text" || v.type === "reasoning") && strings("delta"))
    return { type: v.type, delta: v.delta as string };
  if (v.type === "error" && strings("message"))
    return { type: "error", message: v.message as string };
  if (
    v.type === "source" &&
    strings("id", "url", "title") &&
    /^https?:\/\//u.test(v.url as string)
  )
    return v as unknown as ChatEvent;
  if (
    v.type === "tool" &&
    strings("id", "name", "state") &&
    [
      "input-streaming",
      "input-available",
      "output-available",
      "output-error",
    ].includes(v.state as string) &&
    ["input", "output", "error"].every(
      (key) => v[key] === undefined || typeof v[key] === "string"
    )
  )
    return v as unknown as ChatEvent;
  throw new Error("Unsupported stream event");
}
/** UTF-8 and NDJSON framing without relying on TextDecoder in WeChat's JS runtime. */
export function createEventDecoder(onEvent: (event: ChatEvent) => void) {
  let pending: number[] = [];
  let line = "";
  const append = (text: string) => {
    for (const character of text) {
      if (character === "\n") {
        if (line.trim()) onEvent(event(JSON.parse(line)));
        line = "";
      } else {
        line += character;
        if (line.length > MAX_LINE)
          throw new Error("Stream line exceeds limit");
      }
    }
  };
  return {
    push(chunk: Uint8Array) {
      const bytes = new Uint8Array(pending.length + chunk.length);
      bytes.set(pending);
      bytes.set(chunk, pending.length);
      pending = [];
      let text = "";
      for (let i = 0; i < bytes.length;) {
        const lead = bytes[i];
        const width =
          lead < 128
            ? 1
            : lead >= 194 && lead <= 223
              ? 2
              : lead >= 224 && lead <= 239
                ? 3
                : lead >= 240 && lead <= 244
                  ? 4
                  : 0;
        if (!width) throw new Error("Invalid UTF-8");
        if (i + width > bytes.length) {
          pending = Array.from(bytes.subarray(i));
          break;
        }
        let code = lead & (width === 1 ? 127 : (1 << (7 - width)) - 1);
        for (let j = 1; j < width; j++) {
          if ((bytes[i + j] & 192) !== 128) throw new Error("Invalid UTF-8");
          code = (code << 6) | (bytes[i + j] & 63);
        }
        if (
          (width === 2 && code < 128) ||
          (width === 3 && code < 2048) ||
          (width === 4 && code < 65536) ||
          code > 0x10ffff ||
          (code >= 0xd800 && code <= 0xdfff)
        )
          throw new Error("Invalid UTF-8");
        text += String.fromCodePoint(code);
        i += width;
      }
      append(text);
    },
    end() {
      if (pending.length) throw new Error("Truncated UTF-8");
      if (line.trim()) onEvent(event(JSON.parse(line)));
      line = "";
    },
  };
}
