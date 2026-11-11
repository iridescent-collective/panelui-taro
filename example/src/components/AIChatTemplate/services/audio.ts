import { request, uploadFile, getFileSystemManager, env } from "@tarojs/taro";

import { AI_API_URL } from "./config";
export function transcribe(
  path: string,
  complete: (text: string) => void,
  fail: (message: string) => void
) {
  let closed = false;
  const task = uploadFile({
    url: `${AI_API_URL}/api/transcribe`,
    filePath: path,
    name: "file",
    timeout: 120000,
    success(result) {
      if (closed) return;
      closed = true;
      try {
        const data = JSON.parse(result.data);
        if (result.statusCode !== 200 || typeof data.text !== "string")
          throw new Error(data.error || "Transcription failed");
        complete(data.text);
      } catch (error) {
        fail(error instanceof Error ? error.message : "Invalid transcription");
      }
    },
    fail() {
      if (!closed) {
        closed = true;
        fail("Could not upload the recording");
      }
    },
  });
  void task.catch(() => undefined);
  return () => {
    closed = true;
    task.abort();
  };
}
export function synthesize(
  text: string,
  complete: (path: string) => void,
  fail: (message: string) => void
) {
  let closed = false;
  let file = "";
  const remove = () => {
    if (file) getFileSystemManager().unlink({ filePath: file, fail: () => {} });
  };
  const task = request({
    url: `${AI_API_URL}/api/speech`,
    method: "POST",
    data: { text },
    header: { "content-type": "application/json" },
    responseType: "arraybuffer",
    timeout: 120000,
    success(result) {
      if (closed) return;
      if (result.statusCode !== 200 || !(result.data instanceof ArrayBuffer)) {
        closed = true;
        fail(`Speech service returned ${result.statusCode}`);
        return;
      }
      if (result.data.byteLength > 5 * 1024 * 1024) {
        closed = true;
        fail("Speech output exceeds demo limit");
        return;
      }
      file = `${env.USER_DATA_PATH}/panelui-speech-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;
      getFileSystemManager().writeFile({
        filePath: file,
        data: result.data,
        success: () => {
          if (closed) remove();
          else complete(file);
        },
        fail: () => {
          if (!closed) {
            closed = true;
            fail("Could not save synthesized audio");
          }
        },
      });
    },
    fail() {
      if (!closed) {
        closed = true;
        fail(
          "Speech synthesis failed. Check AI_SPEECH_MODEL on the example server."
        );
      }
    },
  });
  void task.catch(() => undefined);
  return () => {
    closed = true;
    task.abort();
    remove();
  };
}
