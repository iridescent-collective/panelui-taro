import type { ChatTurn } from "../type";
import type { ChatRequest } from "./protocol";
/** Preserve visible tool results as context without accepting client-defined tool execution. */
export function serializeHistory(turns: ChatTurn[]): ChatRequest["messages"] {
  return turns
    .filter((turn) => turn.live)
    .flatMap((turn) => {
      let content = turn.text;
      if (turn.role === "assistant" && turn.parts?.length) {
        content = turn.parts
          .map((part) => {
            if (part.type === "text") return part.text;
            if (part.type === "source")
              return `Source (${part.title}): ${part.url}`;
            if (part.state === "output-available")
              return `Tool result (${part.name}): ${part.output ?? ""}`;
            if (part.state === "output-error")
              return `Tool error (${part.name}): ${part.error ?? ""}`;
            return "";
          })
          .filter(Boolean)
          .join("\n\n");
      }
      if (turn.attachment)
        content +=
          "\n\nSample brief: Build a calm assistant interface with readable conversations, send/stop/retry controls, tools and sources.";
      if (!content.trim()) return [];
      if (content.length > 16000)
        throw new Error(
          "A conversation turn exceeds the demo context limit. Start a new conversation."
        );
      return [{ role: turn.role, content }];
    });
}
