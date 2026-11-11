/** Example-only OpenAI-compatible adapter. No provider SDK is bundled into WeChat. */
export const DOCUMENTS = [
  {
    id: "chat-ui",
    title: "PanelUI Chat UI",
    url: "https://panelui.dev/docs/ai/chat-ui",
  },
  {
    id: "tools",
    title: "PanelUI Tools",
    url: "https://panelui.dev/docs/ai/tools",
  },
  {
    id: "voice",
    title: "PanelUI Voice",
    url: "https://panelui.dev/docs/ai/voice",
  },
];
const tool = {
  type: "function",
  function: {
    name: "findPanelUIDocs",
    description:
      "Find official PanelUI documentation links for chat UI, tools or voice. This is a local link index, not a web search.",
    parameters: {
      type: "object",
      properties: {
        topic: { type: "string", enum: ["chat-ui", "tools", "voice"] },
      },
      required: ["topic"],
      additionalProperties: false,
    },
  },
};
async function* deltas(body) {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let buffer = "";
  let done = false;
  for await (const bytes of body) {
    buffer += decoder.decode(bytes, { stream: true });
    if (buffer.length > 262144) throw new Error("Provider event limit");
    let end;
    while ((end = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, end).trim();
      buffer = buffer.slice(end + 1);
      if (!line.startsWith("data:")) continue;
      const value = line.slice(5).trim();
      if (value === "[DONE]") {
        done = true;
        return;
      }
      const parsed = JSON.parse(value);
      if (parsed.error) throw new Error("Provider stream error");
      const choice = parsed.choices?.[0];
      if (choice) yield choice;
    }
  }
  decoder.decode();
  if (!done) throw new Error("Provider stream truncated");
}
export async function runChat({
  config,
  messages,
  emit,
  signal,
  fetchImpl = fetch,
}) {
  const history = [
    {
      role: "system",
      content:
        "You are a concise assistant. Use findPanelUIDocs when asked for PanelUI documentation. Describe this tool as a local documentation link index. Never imply it searched the web.",
    },
    ...messages,
  ];
  for (let step = 0; step < 5; step++) {
    signal.throwIfAborted();
    const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: history,
        stream: true,
        tools: [tool],
      }),
    });
    if (!response.ok || !response.body)
      throw new Error("Provider request failed");
    const calls = new Map();
    let content = "";
    let finishReason;
    for await (const choice of deltas(response.body)) {
      signal.throwIfAborted();
      const delta = choice.delta ?? {};
      if (typeof delta.content === "string" && delta.content) {
        content += delta.content;
        if (content.length > 131072) throw new Error("Provider output limit");
        await emit({ type: "text", delta: delta.content });
      }
      // Some compatible providers expose this optional extension; never invent a trace.
      if (
        typeof delta.reasoning_content === "string" &&
        delta.reasoning_content
      )
        await emit({ type: "reasoning", delta: delta.reasoning_content });
      for (const fragment of delta.tool_calls ?? []) {
        if (
          !Number.isInteger(fragment.index) ||
          fragment.index < 0 ||
          fragment.index > 7
        )
          throw new Error("Invalid tool call index");
        const call = calls.get(fragment.index) ?? {
          id: "",
          type: "function",
          function: { name: "", arguments: "" },
        };
        call.id += fragment.id ?? "";
        call.function.name += fragment.function?.name ?? "";
        call.function.arguments += fragment.function?.arguments ?? "";
        if (
          call.function.arguments.length > 8192 ||
          call.function.name.length > 128 ||
          call.id.length > 256
        )
          throw new Error("Tool argument limit");
        calls.set(fragment.index, call);
        await emit({
          type: "tool",
          id: `step-${step}-${fragment.index}`,
          name: call.function.name || "Receiving tool call",
          state: "input-streaming",
          input: call.function.arguments,
        });
      }
      if (choice.finish_reason) finishReason = choice.finish_reason;
    }
    if (
      !finishReason ||
      finishReason === "length" ||
      finishReason === "content_filter"
    )
      throw new Error("Provider response incomplete");
    if (!calls.size) {
      await emit({ type: "finish" });
      return;
    }
    if (finishReason !== "tool_calls") throw new Error("Unfinished tool call");
    history.push({
      role: "assistant",
      content: content || null,
      tool_calls: [...calls.values()],
    });
    for (const [index, call] of calls) {
      signal.throwIfAborted();
      const id = `step-${step}-${index}`;
      await emit({
        type: "tool",
        id,
        name: call.function.name,
        state: "input-available",
        input: call.function.arguments,
      });
      let output;
      try {
        const args = JSON.parse(call.function.arguments);
        if (
          !call.id ||
          call.function.name !== "findPanelUIDocs" ||
          !args ||
          typeof args !== "object" ||
          Object.keys(args).length !== 1 ||
          typeof args.topic !== "string"
        )
          throw new Error("Invalid tool input");
        const doc = DOCUMENTS.find((item) => item.id === args.topic);
        if (!doc) throw new Error("Unknown documentation topic");
        output = JSON.stringify({
          ...doc,
          description:
            "Official link from a local documentation index; page contents were not fetched.",
        });
        await emit({
          type: "tool",
          id,
          name: call.function.name,
          state: "output-available",
          output,
        });
        await emit({ type: "source", ...doc });
      } catch {
        output = JSON.stringify({
          error: "Unsupported tool or invalid arguments",
        });
        await emit({
          type: "tool",
          id,
          name: call.function.name,
          state: "output-error",
          error: "Unsupported tool or invalid arguments",
        });
      }
      history.push({ role: "tool", tool_call_id: call.id, content: output });
    }
  }
  throw new Error("Tool step limit reached");
}
