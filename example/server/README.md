# AI example server

A Node development reference for the standalone PanelUI Taro example. No business service or credential is imported. The UI library remains provider-independent.

## Start

From the repository root:

```sh
cp panelui-taro/example/server/.env.example panelui-taro/example/server/.env.local
# Fill AI_BASE_URL, AI_API_KEY and AI_MODEL in the copied file.
pnpm --filter panelui-example dev:ai
# In a second terminal:
TARO_APP_PANELUI_AI_API_URL=http://127.0.0.1:3101 pnpm dev:weapp:panelui
```

Open AI Assistant, open its options, and choose **Connected service**. The existing offline mode needs no server. The public endpoint is injected during the Taro build; provider credentials stay in Node. A real request sends connected conversation text and, if selected, the fixed sample brief. Conversations are held in memory.

The provider must support streaming `/chat/completions` and function tools. The adapter uses HTTP directly rather than installing the AI SDK in the mini program. The example's NDJSON stream is not the AI SDK UIMessage protocol. `findPanelUIDocs` looks up three official links in a local index; it is not web search.

Optional `AI_TRANSCRIPTION_MODEL` and `AI_SPEECH_MODEL` enable `/audio/transcriptions` and `/audio/speech` on the same provider base URL. Configure `AI_SPEECH_VOICE` for your provider. The voice UI records MP3, reviews/transcribes it into an editable draft, and can read the latest complete answer with a labelled AI voice. The wave-level slider is explicitly manual, not microphone metering.

`GET /health` reports readiness and optional audio configuration. Defaults: loopback host, port 3101, no browser origins. For phone testing bind `AI_DEMO_HOST` to the machine's LAN address and use that address in the mini build. A distributed mini program requires HTTPS, request/upload domains, a valid AppID and microphone privacy configuration. This server is not a production authenticated backend; add your application authentication, authorization and per-user usage controls before sharing it.

Limits: 64 messages, 16,000 characters per message, 256 KiB chat request, four concurrent requests, 110-second deadline, five model/tool steps, 5 MiB audio, 4,000 speech characters. Stop, page hide and leaving the screen abort work. Generated speech files are removed when audio closes.

## Checks

```sh
pnpm --filter panelui-example test:ai-server
pnpm test:panelui-example
pnpm --filter panelui-example typecheck
pnpm build:weapp:panelui
```

Tests use a fake provider, without credentials or billable calls. WeChat Developer Tools and physical microphone/keyboard/audio/scroll acceptance must be recorded separately. Provider compatibility and real inference require your configured endpoint.

The full English and Simplified Chinese guides are in `docs/content/docs/ai/`. Upstream provenance is recorded in `ai-upstream.json`; retain `../UPSTREAM-LICENSE` and `../UPSTREAM-NOTICE.md` when copying adapted examples.
