import { describe, expect, it } from "vitest";

import { createEventDecoder } from "./protocol";

describe("chat stream framing", () => {
  it("preserves Chinese and emoji across every byte boundary", () => {
    const events: unknown[] = [];
    const decoder = createEventDecoder((event) => events.push(event));
    const bytes = new TextEncoder().encode(
      '{"type":"text","delta":"你好🌊"}\n{"type":"finish"}\n'
    );
    for (const byte of bytes) decoder.push(new Uint8Array([byte]));
    decoder.end();
    expect(events).toEqual([
      { type: "text", delta: "你好🌊" },
      { type: "finish" },
    ]);
  });
  it("handles CRLF and a final line without a newline", () => {
    const events: unknown[] = [];
    const decoder = createEventDecoder((event) => events.push(event));
    decoder.push(new TextEncoder().encode('\r\n{"type":"finish"}'));
    decoder.end();
    expect(events).toEqual([{ type: "finish" }]);
  });
  it("rejects unknown events, invalid UTF-8 and oversized lines", () => {
    expect(() =>
      createEventDecoder(() => {}).push(
        new TextEncoder().encode('{"type":"wat"}\n')
      )
    ).toThrow();
    expect(() =>
      createEventDecoder(() => {}).push(new Uint8Array([255]))
    ).toThrow();
    expect(() =>
      createEventDecoder(() => {}).push(
        new TextEncoder().encode("x".repeat(262145))
      )
    ).toThrow();
  });
  it("rejects truncated UTF-8 at EOF", () => {
    const decoder = createEventDecoder(() => {});
    decoder.push(new Uint8Array([0xe4, 0xbd]));
    expect(() => decoder.end()).toThrow();
  });
});
