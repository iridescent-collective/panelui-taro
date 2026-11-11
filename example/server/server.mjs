import { once } from "node:events";
import { createServer } from "node:http";

import { runChat } from "./provider.mjs";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
async function readBody(request, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, "Request exceeds demo limit");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
function parseMessages(body) {
  let parsed;
  try {
    parsed = JSON.parse(body.toString("utf8"));
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
  const messages = parsed?.messages;
  if (
    !Array.isArray(messages) ||
    !messages.length ||
    messages.length > 64 ||
    messages.at(-1)?.role !== "user" ||
    messages.some(
      (m) =>
        !m ||
        !["user", "assistant"].includes(m.role) ||
        typeof m.content !== "string" ||
        !m.content.trim() ||
        m.content.length > 16000
    )
  )
    throw new HttpError(400, "Invalid conversation");
  return messages.map(({ role, content }) => ({ role, content }));
}
export function createDemoServer({ config, fetchImpl = fetch }) {
  let active = 0;
  return createServer(async (request, response) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 110000);
    const signal = controller.signal;
    signal.addEventListener(
      "abort",
      () => {
        if (!response.writableEnded) response.destroy();
      },
      { once: true }
    );
    response.on("close", () => controller.abort());
    let acquired = false;
    try {
      // No cross-origin browser access by default. WeChat requests do not carry Origin.
      const origin = request.headers.origin;
      const allowedOrigins = config.allowedOrigins ?? [];
      if (origin && !allowedOrigins.includes(origin))
        throw new HttpError(403, "Origin not allowed");
      if (origin) {
        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Vary", "Origin");
      }
      if (request.method === "OPTIONS") {
        response.writeHead(204, {
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        });
        response.end();
        return;
      }
      if (request.method === "GET" && request.url === "/health") {
        response.setHeader("Content-Type", "application/json");
        response.end(
          JSON.stringify({
            ready: Boolean(config.apiKey && config.model && config.baseUrl),
            transcription: Boolean(config.transcriptionModel),
            speech: Boolean(config.speechModel),
          })
        );
        return;
      }
      if (
        request.method !== "POST" ||
        !["/api/chat", "/api/transcribe", "/api/speech"].includes(request.url)
      )
        throw new HttpError(404, "Not found");
      if (!config.apiKey || !config.baseUrl || !config.model)
        throw new HttpError(503, "Configure the example server first");
      if (active >= 4) throw new HttpError(429, "Demo server is busy");
      active++;
      acquired = true;
      if (request.url === "/api/chat") {
        if (!request.headers["content-type"]?.startsWith("application/json"))
          throw new HttpError(415, "Expected JSON");
        const messages = parseMessages(await readBody(request, 262144));
        response.writeHead(200, {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-store, no-transform",
          "X-Accel-Buffering": "no",
        });
        response.flushHeaders();
        let outputBytes = 0;
        await runChat({
          config,
          messages,
          signal,
          fetchImpl,
          emit: async (event) => {
            signal.throwIfAborted();
            const line = JSON.stringify(event) + "\n";
            outputBytes += Buffer.byteLength(line);
            if (outputBytes > 900000) throw new Error("Response limit");
            if (!response.write(line))
              await once(response, "drain", { signal });
          },
        });
        response.end();
        return;
      }
      if (request.url === "/api/transcribe") {
        if (!config.transcriptionModel)
          throw new HttpError(503, "Set AI_TRANSCRIPTION_MODEL on the server");
        const body = await readBody(request, 5 * 1024 * 1024);
        let form;
        try {
          form = await new Request("http://localhost/upload", {
            method: "POST",
            headers: { "content-type": request.headers["content-type"] ?? "" },
            body,
          }).formData();
        } catch {
          throw new HttpError(400, "Invalid audio upload");
        }
        const file = form.get("file");
        if (!(file instanceof File) || !file.size)
          throw new HttpError(400, "Expected an audio file");
        const upstream = new FormData();
        upstream.append("model", config.transcriptionModel);
        upstream.append("file", file, "recording.mp3");
        const result = await fetchImpl(
          `${config.baseUrl}/audio/transcriptions`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${config.apiKey}` },
            body: upstream,
            signal,
          }
        );
        if (!result.ok) throw new HttpError(502, "Transcription failed");
        const data = await result.json();
        if (typeof data.text !== "string" || data.text.length > 16000)
          throw new HttpError(502, "Invalid transcription");
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ text: data.text }));
        return;
      }
      if (!config.speechModel)
        throw new HttpError(503, "Set AI_SPEECH_MODEL on the server");
      let text;
      try {
        text = JSON.parse((await readBody(request, 20000)).toString()).text;
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw new HttpError(400, "Invalid JSON");
      }
      if (typeof text !== "string" || !text.trim() || text.length > 4000)
        throw new HttpError(400, "Speech text limit is 4000 characters");
      const result = await fetchImpl(`${config.baseUrl}/audio/speech`, {
        method: "POST",
        signal,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.speechModel,
          voice: config.speechVoice || "alloy",
          input: text,
          response_format: "mp3",
        }),
      });
      if (!result.ok || !result.body)
        throw new HttpError(502, "Speech synthesis failed");
      const chunks = [];
      let size = 0;
      for await (const chunk of result.body) {
        size += chunk.length;
        if (size > 5 * 1024 * 1024)
          throw new HttpError(502, "Speech output limit");
        chunks.push(chunk);
      }
      response.setHeader("Content-Type", "audio/mpeg");
      response.end(Buffer.concat(chunks));
    } catch (error) {
      if (response.destroyed || signal.aborted) {
        response.destroy();
        return;
      }
      if (response.headersSent)
        response.end(
          JSON.stringify({
            type: "error",
            message:
              "Generation failed or the provider stream was interrupted. Retry the response.",
          }) + "\n"
        );
      else {
        response.writeHead(error instanceof HttpError ? error.status : 502, {
          "Content-Type": "application/json",
        });
        response.end(
          JSON.stringify({
            error:
              error instanceof HttpError
                ? error.message
                : "Provider request failed",
          })
        );
      }
    } finally {
      clearTimeout(timeout);
      if (acquired) active--;
    }
  });
}
