import { request } from "@tarojs/taro";

import { createEventDecoder } from "./protocol";
import type { ChatTransport } from "./protocol";

export const createWeappTransport =
  (baseUrl: string): ChatTransport =>
  (body, onEvent, onError) => {
    let closed = false;
    let finished = false;
    let received = false;
    let size = 0;
    let status = 0;
    let task: ReturnType<typeof request> | undefined;
    const fail = (error: unknown) => {
      if (closed || finished) return;
      closed = true;
      task?.abort();
      onError(error instanceof Error ? error : new Error("Connection failed"));
    };
    const decoder = createEventDecoder((event) => {
      if (closed || finished) return;
      if (event.type === "finish" || event.type === "error") finished = true;
      onEvent(event);
    });
    const push = (data: ArrayBuffer) => {
      size += data.byteLength;
      if (size > 1024 * 1024) throw new Error("Response exceeds demo limit");
      decoder.push(new Uint8Array(data));
    };
    try {
      task = request({
        url: `${baseUrl}/api/chat`,
        method: "POST",
        data: body,
        header: {
          "content-type": "application/json",
          Accept: "application/x-ndjson",
        },
        enableChunked: true,
        responseType: "arraybuffer",
        dataType: "text",
        timeout: 120000,
        success(response) {
          if (closed) return;
          try {
            if (response.statusCode !== 200)
              throw new Error(`Chat service returned ${response.statusCode}`);
            if (!received && response.data instanceof ArrayBuffer)
              push(response.data);
            decoder.end();
            if (!finished)
              throw new Error("Connection ended before the response completed");
            closed = true;
          } catch (error) {
            fail(error);
          }
        },
        fail(error) {
          fail(new Error(error.errMsg || "Connection failed"));
        },
      });
      // Taro also rejects the promisified task when callbacks handle a failure.
      void task.catch(() => undefined);
      task.onHeadersReceived((headers) => {
        status = (headers as { statusCode?: number }).statusCode ?? 0;
      });
      task.onChunkReceived(({ data }) => {
        if (closed) return;
        try {
          if (status && status !== 200)
            throw new Error(`Chat service returned ${status}`);
          received = true;
          push(data);
        } catch (error) {
          fail(error);
        }
      });
    } catch (error) {
      fail(error);
    }
    return () => {
      closed = true;
      task?.abort();
    };
  };
