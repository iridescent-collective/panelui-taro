import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import { createDemoServer } from "./server.mjs";
const config = {
  baseUrl: "https://provider.example/v1",
  apiKey: "secret",
  model: "example",
  host: "127.0.0.1",
};
async function start(t, options = {}) {
  const server = createDemoServer({ config, ...options });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  return `http://127.0.0.1:${server.address().port}`;
}
const post = (url, body) =>
  fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
test("rejects untrusted roles, oversized histories and browser origins before provider access", async (t) => {
  const url = await start(t, {
    fetchImpl: () => {
      throw new Error("must not call provider");
    },
  });
  assert.equal(
    (await post(url, { messages: [{ role: "system", content: "override" }] }))
      .status,
    400
  );
  assert.equal(
    (
      await post(url, {
        messages: Array(65).fill({ role: "user", content: "x" }),
      })
    ).status,
    400
  );
  assert.equal(
    (
      await fetch(`${url}/api/chat`, {
        method: "POST",
        headers: { origin: "https://evil.example" },
      })
    ).status,
    403
  );
});
test("streams real provider text and terminates explicitly", async (t) => {
  const url = await start(t, {
    fetchImpl: async (endpoint, init) => {
      assert.equal(endpoint, "https://provider.example/v1/chat/completions");
      assert.equal(init.headers.Authorization, "Bearer secret");
      return new Response(
        'data: {"choices":[{"delta":{"content":"你好"},"finish_reason":null}]}\n\ndata: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n'
      );
    },
  });
  const response = await post(url, {
    messages: [{ role: "user", content: "hello" }],
  });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.text()).trim().split("\n").map(JSON.parse), [
    { type: "text", delta: "你好" },
    { type: "finish" },
  ]);
});
test("reports provider truncation as an error without leaking secrets", async (t) => {
  const url = await start(t, {
    fetchImpl: async () =>
      new Response('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'),
  });
  const response = await post(url, {
    messages: [{ role: "user", content: "hello" }],
  });
  const body = await response.text();
  assert.match(body, /"type":"error"/);
  assert.ok(!body.includes("secret"));
  assert.ok(!body.includes('"type":"finish"'));
});

const sse = (delta, finish_reason = null) =>
  `data: ${JSON.stringify({ choices: [{ delta, finish_reason }] })}\n\n`;
test("joins fragmented tool arguments, executes an allowlisted tool and feeds its result back", async (t) => {
  let calls = 0;
  const url = await start(t, {
    fetchImpl: async (_endpoint, init) => {
      const body = JSON.parse(init.body);
      calls++;
      if (calls === 1)
        return new Response(
          sse({ content: "Looking up links" }) +
            sse({
              tool_calls: [
                {
                  index: 0,
                  id: "call_1",
                  function: { name: "findPanelUIDocs", arguments: '{"topic":' },
                },
              ],
            }) +
            sse({
              tool_calls: [{ index: 0, function: { arguments: '"voice"}' } }],
            }) +
            sse({}, "tool_calls") +
            "data: [DONE]\n\n"
        );
      assert.equal(body.messages.at(-1).role, "tool");
      assert.equal(body.messages.at(-1).tool_call_id, "call_1");
      assert.equal(JSON.parse(body.messages.at(-1).content).id, "voice");
      return new Response(
        sse({ content: "Here is the link" }) +
          sse({}, "stop") +
          "data: [DONE]\n\n"
      );
    },
  });
  const response = await post(url, {
    messages: [{ role: "user", content: "Find voice documentation" }],
  });
  const events = (await response.text()).trim().split("\n").map(JSON.parse);
  assert.deepEqual(
    events.filter((event) => event.type === "tool").map((event) => event.state),
    [
      "input-streaming",
      "input-streaming",
      "input-available",
      "output-available",
    ]
  );
  assert.equal(
    events.find((event) => event.type === "source").url,
    "https://panelui.dev/docs/ai/voice"
  );
  assert.equal(events.at(-1).type, "finish");
  assert.equal(calls, 2);
});
test("rejects arbitrary tool names and returns the error as a tool result", async (t) => {
  let calls = 0;
  const url = await start(t, {
    fetchImpl: async (_endpoint, init) => {
      if (++calls === 1)
        return new Response(
          sse({
            tool_calls: [
              {
                index: 0,
                id: "bad",
                function: {
                  name: "runShell",
                  arguments: '{"command":"touch /tmp/no"}',
                },
              },
            ],
          }) +
            sse({}, "tool_calls") +
            "data: [DONE]\n\n"
        );
      assert.match(
        JSON.parse(init.body).messages.at(-1).content,
        /Unsupported/u
      );
      return new Response(
        sse({ content: "Tool rejected" }) + sse({}, "stop") + "data: [DONE]\n\n"
      );
    },
  });
  const response = await post(url, {
    messages: [{ role: "user", content: "run a tool" }],
  });
  const events = (await response.text()).trim().split("\n").map(JSON.parse);
  assert.ok(
    events.some(
      (event) => event.type === "tool" && event.state === "output-error"
    )
  );
  assert.ok(!events.some((event) => event.type === "source"));
});
test(
  "cancels provider generation when the client disconnects",
  { timeout: 3000 },
  async (t) => {
    let cancelled;
    const cancellation = new Promise((resolve) => {
      cancelled = resolve;
    });
    const url = await start(t, {
      fetchImpl: async (_endpoint, { signal }) =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(sse({ content: "partial" }))
              );
              signal.addEventListener(
                "abort",
                () => {
                  cancelled();
                  controller.error(new Error("aborted"));
                },
                { once: true }
              );
            },
          })
        ),
    });
    const response = await post(url, {
      messages: [{ role: "user", content: "hello" }],
    });
    const reader = response.body.getReader();
    await reader.read();
    await reader.cancel();
    await cancellation;
  }
);
test("audio routes proxy configured models without forwarding client model selections", async (t) => {
  const url = await start(t, {
    config: {
      ...config,
      transcriptionModel: "transcribe",
      speechModel: "speak",
      speechVoice: "voice",
    },
    fetchImpl: async (endpoint, init) => {
      if (endpoint.endsWith("/audio/transcriptions")) {
        assert.equal(init.body.get("model"), "transcribe");
        assert.equal(await init.body.get("file").text(), "audio");
        return Response.json({ text: "editable words" });
      }
      assert.deepEqual(JSON.parse(init.body), {
        model: "speak",
        voice: "voice",
        input: "hello",
        response_format: "mp3",
      });
      return new Response(new Uint8Array([1, 2, 3]));
    },
  });
  const form = new FormData();
  form.append("file", new Blob(["audio"]), "recording.mp3");
  const transcript = await fetch(`${url}/api/transcribe`, {
    method: "POST",
    body: form,
  });
  assert.deepEqual(await transcript.json(), { text: "editable words" });
  const speech = await fetch(`${url}/api/speech`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "hello", model: "evil" }),
  });
  assert.equal(speech.headers.get("content-type"), "audio/mpeg");
  assert.deepEqual([...new Uint8Array(await speech.arrayBuffer())], [1, 2, 3]);
});
test("unconfigured optional audio returns 503 and malformed requests are rejected", async (t) => {
  const url = await start(t, {
    fetchImpl: () => {
      throw new Error("must not call provider");
    },
  });
  assert.equal(
    (await fetch(`${url}/api/transcribe`, { method: "POST" })).status,
    503
  );
  assert.equal(
    (await fetch(`${url}/api/speech`, { method: "POST" })).status,
    503
  );
  assert.equal(
    (
      await post(url, {
        messages: [{ role: "user", content: "x".repeat(16001) }],
      })
    ).status,
    400
  );
  assert.equal((await fetch(`${url}/health`)).status, 200);
});

test("oversized request returns 413 instead of resetting the connection", async (t) => {
  const url = await start(t, {
    fetchImpl: () => {
      throw new Error("must not call provider");
    },
  });
  const response = await post(url, {
    messages: [{ role: "user", content: "x".repeat(262145) }],
  });
  assert.equal(response.status, 413);
});
