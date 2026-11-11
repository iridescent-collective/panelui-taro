import { createDemoServer } from "./server.mjs";
const baseUrl = (process.env.AI_BASE_URL || "").replace(/\/$/u, "");
if (baseUrl && !/^https?:\/\//u.test(baseUrl))
  throw new Error("AI_BASE_URL must be an HTTP(S) URL");
const host = process.env.AI_DEMO_HOST || "127.0.0.1";
const port = Number(process.env.AI_DEMO_PORT || 3101);
const server = createDemoServer({
  config: {
    host,
    baseUrl,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL,
    transcriptionModel: process.env.AI_TRANSCRIPTION_MODEL,
    speechModel: process.env.AI_SPEECH_MODEL,
    speechVoice: process.env.AI_SPEECH_VOICE,
    allowedOrigins: (process.env.AI_ALLOWED_ORIGINS || "")
      .split(",")
      .filter(Boolean),
  },
});
server.listen(port, host, () =>
  console.log(`PanelUI example AI server: http://${host}:${port}`)
);
