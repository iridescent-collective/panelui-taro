import { request, uploadFile, getFileSystemManager } from "@tarojs/taro";
import { beforeEach, expect, it, vi } from "vitest";

import { synthesize, transcribe } from "./audio";
vi.mock("@tarojs/taro", () => ({
  request: vi.fn(),
  uploadFile: vi.fn(),
  getFileSystemManager: vi.fn(),
  env: { USER_DATA_PATH: "/user-data" },
}));
let requestOptions: any;
let uploadOptions: any;
let writeOptions: any;
const abort = vi.fn();
const unlink = vi.fn();
beforeEach(() => {
  const task = Object.assign(Promise.resolve({}), { abort });
  vi.mocked(request).mockImplementation(((options: any) => {
    requestOptions = options;
    return task;
  }) as any);
  vi.mocked(uploadFile).mockImplementation(((options: any) => {
    uploadOptions = options;
    return task;
  }) as any);
  vi.mocked(getFileSystemManager).mockReturnValue({
    writeFile: vi.fn((options: any) => {
      writeOptions = options;
    }),
    unlink,
  } as any);
});
it("returns editable transcription and ignores aborted uploads", () => {
  const complete = vi.fn();
  const fail = vi.fn();
  transcribe("/tmp/note.mp3", complete, fail);
  uploadOptions.success({ statusCode: 200, data: '{"text":"edit me"}' });
  expect(complete).toHaveBeenCalledWith("edit me");
  const cancel = transcribe("/tmp/note.mp3", complete, fail);
  cancel();
  uploadOptions.success({ statusCode: 200, data: '{"text":"late"}' });
  uploadOptions.fail();
  expect(complete).toHaveBeenCalledTimes(1);
  expect(fail).not.toHaveBeenCalled();
  expect(abort).toHaveBeenCalled();
});
it("removes late speech files after cancellation without starting playback", () => {
  const complete = vi.fn();
  const fail = vi.fn();
  const cancel = synthesize("hello", complete, fail);
  requestOptions.success({ statusCode: 200, data: new ArrayBuffer(3) });
  const file = writeOptions.filePath;
  expect(file).toMatch(/^\/user-data\/panelui-speech-/u);
  cancel();
  writeOptions.success();
  expect(complete).not.toHaveBeenCalled();
  expect(fail).not.toHaveBeenCalled();
  expect(unlink).toHaveBeenCalledWith(
    expect.objectContaining({ filePath: file })
  );
});
it("reports service errors and only completes after the audio file is saved", () => {
  const complete = vi.fn();
  const fail = vi.fn();
  synthesize("hello", complete, fail);
  requestOptions.success({ statusCode: 503, data: new ArrayBuffer(0) });
  expect(fail).toHaveBeenCalledWith("Speech service returned 503");
  synthesize("hello", complete, fail);
  requestOptions.success({ statusCode: 200, data: new ArrayBuffer(3) });
  expect(complete).not.toHaveBeenCalled();
  writeOptions.success();
  expect(complete).toHaveBeenCalledWith(writeOptions.filePath);
});
