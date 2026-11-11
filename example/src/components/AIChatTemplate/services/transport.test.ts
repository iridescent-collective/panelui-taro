import { request } from "@tarojs/taro";
import { beforeEach, expect, it, vi } from "vitest";

import { createWeappTransport } from "./transport";
vi.mock("@tarojs/taro", () => ({ request: vi.fn() }));
let options: Record<string, any>;
let chunk: (value: { data: ArrayBuffer }) => void;
let headers: (value: any) => void;
const abort = vi.fn();
beforeEach(() => {
  vi.mocked(request).mockImplementation(((value: any) => {
    options = value;
    const task = Promise.resolve({}) as any;
    task.abort = abort;
    task.onHeadersReceived = (callback: any) => {
      headers = callback;
    };
    task.onChunkReceived = (callback: any) => {
      chunk = callback;
    };
    return task;
  }) as typeof request);
});
const bytes = (value: string) => new TextEncoder().encode(value).buffer;
it("delivers chunks before request success and does not duplicate the buffered response", () => {
  const event = vi.fn();
  const fail = vi.fn();
  createWeappTransport("https://example.test")(
    { messages: [{ role: "user", content: "hi" }] },
    event,
    fail
  );
  expect(options.enableChunked).toBe(true);
  headers({ header: {}, statusCode: 200 });
  chunk({ data: bytes('{"type":"text","delta":"hello"}\n') });
  expect(event).toHaveBeenCalledWith({ type: "text", delta: "hello" });
  chunk({ data: bytes('{"type":"finish"}\n') });
  options.success({
    statusCode: 200,
    data: bytes('{"type":"text","delta":"duplicate"}\n'),
  });
  expect(event).toHaveBeenCalledTimes(2);
  expect(fail).not.toHaveBeenCalled();
});
it("reports early EOF and HTTP failures", () => {
  const fail = vi.fn();
  createWeappTransport("https://example.test")({ messages: [] }, vi.fn(), fail);
  options.success({
    statusCode: 200,
    data: bytes('{"type":"text","delta":"partial"}\n'),
  });
  expect(fail.mock.calls[0][0].message).toMatch(/before.*completed/u);
  createWeappTransport("https://example.test")({ messages: [] }, vi.fn(), fail);
  options.success({ statusCode: 503, data: new ArrayBuffer(0) });
  expect(fail.mock.calls[1][0].message).toMatch(/503/u);
});
it("aborts and ignores all late callbacks", () => {
  const event = vi.fn();
  const fail = vi.fn();
  const cancel = createWeappTransport("https://example.test")(
    { messages: [] },
    event,
    fail
  );
  cancel();
  expect(abort).toHaveBeenCalled();
  chunk({ data: bytes('{"type":"text","delta":"late"}\n') });
  options.fail({ errMsg: "abort" });
  options.success({ statusCode: 200, data: new ArrayBuffer(0) });
  expect(event).not.toHaveBeenCalled();
  expect(fail).not.toHaveBeenCalled();
});
it("handles a platform that buffers the entire response", () => {
  const event = vi.fn();
  const fail = vi.fn();
  createWeappTransport("https://example.test")({ messages: [] }, event, fail);
  options.success({ statusCode: 200, data: bytes('{"type":"finish"}\n') });
  expect(event).toHaveBeenCalledWith({ type: "finish" });
  expect(fail).not.toHaveBeenCalled();
});
