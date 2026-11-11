export type ReplyKind = "research" | "code" | "summary" | "general";
export type ReplyPhase =
  | "submitted"
  | "streaming"
  | "complete"
  | "stopped"
  | "error";
export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  phase: ReplyPhase;
  kind: ReplyKind;
  attachment?: boolean;
  live?: boolean;
  error?: string;
  reasoning?: string;
  reasoningStreaming?: boolean;
  parts?: LivePart[];
}
export interface ChatSession {
  mode: "demo" | "live";
  id: string;
  title: string;
  messages: ChatTurn[];
  draft: string;
  model: string;
  attachment: boolean;
}
export interface StreamJob {
  sessionId: string;
  messageId: string;
  text: string;
  fail: boolean;
}

export type LivePart =
  | { type: "text"; text: string }
  | {
      type: "tool";
      id: string;
      name: string;
      state: import("./services/protocol").ToolState;
      input?: string;
      output?: string;
      error?: string;
    }
  | { type: "source"; id: string; url: string; title: string };
