import type { ChatTurn, LivePart } from "../type";
import type { ChatEvent } from "./protocol";
export function reduceEvent(turn: ChatTurn, event: ChatEvent): ChatTurn {
  turn = { ...turn, reasoningStreaming: event.type === "reasoning" };
  if (event.type === "finish") return { ...turn, phase: "complete" };
  if (event.type === "error")
    return { ...turn, phase: "error", error: event.message };
  if (event.type === "reasoning")
    return {
      ...turn,
      phase: "streaming",
      reasoning: (turn.reasoning ?? "") + event.delta,
    };
  const parts = [...(turn.parts ?? [])];
  if (event.type === "text") {
    const last = parts.at(-1);
    if (last?.type === "text")
      parts[parts.length - 1] = { type: "text", text: last.text + event.delta };
    else parts.push({ type: "text", text: event.delta });
    return {
      ...turn,
      parts,
      phase: "streaming",
      text: turn.text + event.delta,
    };
  }
  const index = parts.findIndex(
    (part) => part.type === event.type && "id" in part && part.id === event.id
  );
  if (index < 0) parts.push(event);
  else parts[index] = { ...parts[index], ...event } as LivePart;
  return { ...turn, parts, phase: "streaming" };
}
