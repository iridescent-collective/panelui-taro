import { act, renderHook } from "@testing-library/react";
// @vitest-environment happy-dom
import { StrictMode } from "react";
import { afterEach, expect, it, vi } from "vitest";

import type {
  FileUploadFile,
  FileUploadHandlerContext,
  FileUploadProps,
} from "../src/components/FileUpload/types";
import { useUploadQueue } from "../src/components/FileUpload/use-upload-queue";
import { deferred as makeDeferred } from "./helpers/deferred";

const deferred = () => makeDeferred<unknown>();
const file = (id: string): FileUploadFile => ({
  id,
  kind: "document",
  name: `${id}.pdf`,
  size: 100,
  status: "idle",
  uri: id,
});
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("starts FIFO within concurrency, holds processing and advances after completion", async () => {
  const jobs = [deferred(), deferred(), deferred()];
  const contexts: FileUploadHandlerContext[] = [];
  const upload = vi.fn((_file, context) => {
    contexts.push(context);
    return jobs[contexts.length - 1].promise;
  });
  const complete = vi.fn();
  const { result } = renderHook(() =>
    useUploadQueue({
      concurrency: 2,
      multiple: true,
      onUploadComplete: complete,
      upload,
    })
  );
  act(() => result.current.addFiles([file("a"), file("b"), file("c")]));
  await settle();
  expect(upload).toHaveBeenCalledTimes(2);
  act(() => contexts[0].setProcessing());
  expect(result.current.files[0].status).toBe("processing");
  act(() => jobs[0].resolve("url"));
  await settle();
  expect(upload).toHaveBeenCalledTimes(3);
  expect(complete).toHaveBeenCalledWith(
    expect.objectContaining({ id: "a", response: "url", status: "done" })
  );
});
it("ignores late completion and progress after cancel and retries a new attempt", async () => {
  const jobs = [deferred(), deferred()];
  const contexts: FileUploadHandlerContext[] = [];
  const upload = vi.fn((_f, c) => {
    contexts.push(c);
    return jobs[contexts.length - 1].promise;
  });
  const { result } = renderHook(() => useUploadQueue({ upload }));
  act(() => result.current.addFiles([file("a")]));
  await settle();
  act(() => result.current.cancel("a"));
  expect(contexts[0].signal.aborted).toBe(true);
  act(() => result.current.retry("a"));
  await settle();
  act(() => {
    contexts[0].onProgress(0.8);
    jobs[0].resolve("old");
  });
  await settle();
  expect(result.current.files[0].status).toBe("uploading");
  act(() => jobs[1].resolve("new"));
  await settle();
  expect(result.current.files[0].response).toBe("new");
});
it("works without native AbortController or requestAnimationFrame and batches progress", async () => {
  vi.stubGlobal("AbortController", Reflect.get({}, "AbortController"));
  vi.stubGlobal(
    "requestAnimationFrame",
    Reflect.get({}, "requestAnimationFrame")
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    Reflect.get({}, "cancelAnimationFrame")
  );
  vi.useFakeTimers();
  let context!: FileUploadHandlerContext;
  const done = deferred();
  const { result, unmount } = renderHook(() =>
    useUploadQueue({
      upload: (_f, c) => {
        context = c;
        return done.promise;
      },
    })
  );
  act(() => result.current.addFiles([file("a")]));
  await settle();
  act(() => {
    context.onProgress(-1);
    context.onProgress(0.7);
  });
  expect(result.current.files[0].progress).toBe(0);
  act(() => vi.advanceTimersByTime(20));
  expect(result.current.files[0].progress).toBe(0.7);
  const abort = vi.fn();
  context.signal.addEventListener("abort", abort);
  unmount();
  expect(context.signal.aborted).toBe(true);
  expect(abort).toHaveBeenCalledTimes(1);
});
it("supports manual upload, rejection and single-file replacement abort", async () => {
  const jobs = deferred();
  let context!: FileUploadHandlerContext;
  const reject = vi.fn();
  const { result } = renderHook(() =>
    useUploadQueue({
      accept: [".pdf"],
      autoUpload: false,
      maxSize: 200,
      onReject: reject,
      upload: (_f, c) => {
        context = c;
        return jobs.promise;
      },
    })
  );
  act(() =>
    result.current.addFiles([{ ...file("x"), name: "x.jpg" }, file("a")])
  );
  expect(reject).toHaveBeenCalledTimes(1);
  expect(result.current.files[0].status).toBe("idle");
  act(() => result.current.upload());
  await settle();
  act(() => result.current.addFiles([file("b")]));
  expect(context.signal.aborted).toBe(true);
  expect(result.current.files.map((f) => f.id)).toEqual(["b"]);
});
it("serializes controlled additions before owner rerenders", () => {
  const changes = vi.fn();
  const original: FileUploadFile[] = [];
  const { result } = renderHook(() =>
    useUploadQueue({
      maxFiles: 2,
      multiple: true,
      onValueChange: changes,
      value: original,
    })
  );
  act(() => {
    result.current.addFiles([file("a")]);
    result.current.addFiles([file("b")]);
    result.current.addFiles([file("c")]);
  });
  expect(result.current.getFiles().map((f) => f.id)).toEqual(["a", "b"]);
  expect(changes).toHaveBeenLastCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ id: "a" }),
      expect.objectContaining({ id: "b" }),
    ])
  );
});
it("aborts externally removed controlled files and ignores settled callbacks", async () => {
  const done = deferred();
  let context!: FileUploadHandlerContext;
  const complete = vi.fn();
  const { result, rerender } = renderHook(
    (props: FileUploadProps) => useUploadQueue(props),
    {
      initialProps: {
        onUploadComplete: complete,
        upload: (_f, c) => {
          context = c;
          return done.promise;
        },
        value: [{ ...file("a"), status: "queued" }],
      } as FileUploadProps,
    }
  );
  await settle();
  rerender({
    onUploadComplete: complete,
    upload: () => done.promise,
    value: [],
  });
  expect(context.signal.aborted).toBe(true);
  act(() => done.resolve("late"));
  await settle();
  expect(complete).not.toHaveBeenCalled();
  expect(result.current.files).toEqual([]);
});
it("guards disabled actions and clears running and queued work", async () => {
  const done = deferred();
  let context!: FileUploadHandlerContext;
  const { result, rerender } = renderHook(
    (props: FileUploadProps) => useUploadQueue(props),
    {
      initialProps: {
        concurrency: 1,
        multiple: true,
        upload: (_f, c) => {
          context = c;
          return done.promise;
        },
      } as FileUploadProps,
    }
  );
  act(() => result.current.addFiles([file("a"), file("b")]));
  await settle();
  rerender({ disabled: true, multiple: true, upload: () => done.promise });
  act(() => {
    result.current.remove("a");
    result.current.clear();
    result.current.cancel("a");
    result.current.addFiles([file("c")]);
  });
  expect(result.current.files).toHaveLength(2);
  rerender({ multiple: true, upload: () => done.promise });
  act(() => result.current.clear());
  expect(context.signal.aborted).toBe(true);
  expect(result.current.files).toEqual([]);
});
it("preserves upload errors and only retries when explicitly requested", async () => {
  const jobs = [deferred(), deferred()];
  const upload = vi.fn(() => jobs[upload.mock.calls.length - 1].promise);
  const { result } = renderHook(() => useUploadQueue({ upload }));
  act(() => result.current.addFiles([file("a")]));
  await settle();
  act(() => jobs[0].reject(new Error("Storage unavailable")));
  await settle();
  expect(result.current.files[0]).toMatchObject({
    error: "Storage unavailable",
    status: "error",
  });
  expect(upload).toHaveBeenCalledTimes(1);
  act(() => result.current.retry("a"));
  await settle();
  expect(upload).toHaveBeenCalledTimes(2);
  act(() => jobs[1].resolve("ready"));
  await settle();
  expect(result.current.files[0]).toMatchObject({
    error: undefined,
    status: "done",
  });
});
it("does not let stale progress roll processing or completion backwards", async () => {
  vi.useFakeTimers();
  let context!: FileUploadHandlerContext;
  const done = deferred();
  const { result } = renderHook(() =>
    useUploadQueue({
      upload: (_f, c) => {
        context = c;
        return done.promise;
      },
    })
  );
  act(() => result.current.addFiles([file("a")]));
  await settle();
  act(() => {
    context.onProgress(0.2);
    context.setProcessing();
    context.onProgress(0.3);
    vi.advanceTimersByTime(20);
  });
  expect(result.current.files[0]).toMatchObject({
    progress: 1,
    status: "processing",
  });
  act(() => done.resolve("ok"));
  await settle();
  act(() => {
    context.onProgress(0.1);
    context.setProcessing();
    vi.advanceTimersByTime(20);
  });
  expect(result.current.files[0]).toMatchObject({
    progress: 1,
    status: "done",
  });
});
it("uses changed validation rules for in-flight picker additions", () => {
  const { result, rerender } = renderHook(
    (props: FileUploadProps) => useUploadQueue(props),
    { initialProps: { maxFiles: 3, multiple: true } as FileUploadProps }
  );
  act(() => result.current.addFiles([file("a")]));
  const add = result.current.addFiles;
  rerender({ maxFiles: 1, multiple: true });
  act(() => add([file("b")]));
  expect(result.current.files.map((f) => f.id)).toEqual(["a"]);
  expect(result.current.rejections[0].reason).toBe("count");
});
it("clear stops running and queued uploads and no late completion repopulates", async () => {
  const done = deferred();
  const complete = vi.fn();
  const upload = vi.fn(() => done.promise);
  const { result } = renderHook(() =>
    useUploadQueue({
      concurrency: 1,
      multiple: true,
      onUploadComplete: complete,
      upload,
    })
  );
  act(() => result.current.addFiles([file("a"), file("b")]));
  await settle();
  act(() => result.current.clear());
  act(() => done.resolve("late"));
  await settle();
  expect(result.current.files).toEqual([]);
  expect(upload).toHaveBeenCalledTimes(1);
  expect(complete).not.toHaveBeenCalled();
});
it("restarts aborted effect setup in StrictMode without leaving a file stuck uploading", async () => {
  const completed = deferred();
  const upload = vi.fn(() => completed.promise);
  const { result } = renderHook(
    () =>
      useUploadQueue({
        defaultValue: [{ ...file("strict"), status: "queued" }],
        upload,
      }),
    { wrapper: StrictMode }
  );
  act(() => completed.resolve("strict-ready"));
  await settle();
  expect(result.current.files[0]).toMatchObject({
    response: "strict-ready",
    status: "done",
  });
});
it("keeps already queued uploads running when controls become disabled", async () => {
  const done = deferred();
  const upload = vi.fn(() => done.promise);
  const { result } = renderHook(() =>
    useUploadQueue({
      defaultValue: [{ ...file("a"), status: "queued" }],
      disabled: true,
      upload,
    })
  );
  await settle();
  expect(upload).toHaveBeenCalledTimes(1);
  act(() => done.resolve("finished"));
  await settle();
  expect(result.current.files[0].status).toBe("done");
});
it.each(["cancel", "remove", "clear"] as const)(
  "finishes %s with every abort listener notified even when consumers throw",
  async (action) => {
    vi.stubGlobal("AbortController", Reflect.get({}, "missing"));
    const done = deferred();
    const notified = vi.fn();
    const objectNotified = vi.fn();
    let context!: FileUploadHandlerContext;
    const { result } = renderHook(() =>
      useUploadQueue({
        upload: (_f, c) => {
          context = c;
          Object.assign(c.signal, {
            onabort: () => {
              throw new Error("property listener failed");
            },
          });
          c.signal.addEventListener("abort", () => {
            throw new Error("function listener failed");
          });
          c.signal.addEventListener("abort", {
            handleEvent: () => {
              objectNotified();
              throw new Error("object listener failed");
            },
          });
          c.signal.addEventListener("abort", notified);
          return done.promise;
        },
      })
    );
    act(() => result.current.addFiles([file("a")]));
    await settle();
    expect(() =>
      act(() => {
        if (action === "clear") {
          result.current.clear();
        } else {
          result.current[action]("a");
        }
      })
    ).not.toThrow();
    expect(context.signal.aborted).toBe(true);
    expect(notified).toHaveBeenCalledTimes(1);
    expect(objectNotified).toHaveBeenCalledTimes(1);
    expect(result.current.files).toEqual(
      action === "cancel"
        ? [expect.objectContaining({ status: "canceled" })]
        : []
    );
    act(() => done.resolve("late"));
    await settle();
    expect(result.current.getFiles()).toEqual(
      action === "cancel"
        ? [expect.objectContaining({ status: "canceled" })]
        : []
    );
  }
);
it("does not attach an old upload result to a replacement controlled URI with the same id", async () => {
  const done = deferred();
  let context!: FileUploadHandlerContext;
  const changes = vi.fn();
  const upload = vi.fn((_f, c) => {
    context = c;
    return done.promise;
  });
  const { result, rerender } = renderHook(
    (p: FileUploadProps) => useUploadQueue(p),
    {
      initialProps: {
        onValueChange: changes,
        upload,
        value: [{ ...file("a"), status: "queued" }],
      } as FileUploadProps,
    }
  );
  await settle();
  rerender({
    onValueChange: changes,
    upload,
    value: [{ ...file("a"), status: "uploading", uri: "replacement" }],
  });
  expect(context.signal.aborted).toBe(true);
  act(() => {
    context.onProgress(0.8);
    context.setProcessing();
    done.resolve("old-url");
  });
  await settle();
  expect(result.current.getFiles()).toEqual([
    expect.objectContaining({ status: "uploading", uri: "replacement" }),
  ]);
  expect(result.current.getFiles()[0].response).toBeUndefined();
});
it("starts a new controlled queued source under the same id and ignores the replaced attempt", async () => {
  const jobs = [deferred(), deferred()];
  const contexts: FileUploadHandlerContext[] = [];
  const upload = vi.fn((_f, c) => {
    contexts.push(c);
    return jobs[contexts.length - 1].promise;
  });
  const { result, rerender } = renderHook(
    (p: FileUploadProps) => useUploadQueue(p),
    {
      initialProps: {
        upload,
        value: [{ ...file("a"), status: "queued" }],
      } as FileUploadProps,
    }
  );
  await settle();
  rerender({
    upload,
    value: [{ ...file("a"), status: "queued", uri: "replacement" }],
  });
  await settle();
  expect(contexts[0].signal.aborted).toBe(true);
  expect(upload).toHaveBeenCalledTimes(2);
  act(() => jobs[0].resolve("old-url"));
  await settle();
  expect(result.current.getFiles()[0].response).toBeUndefined();
  act(() => jobs[1].resolve("new-url"));
  await settle();
  expect(result.current.getFiles()[0]).toMatchObject({
    response: "new-url",
    status: "done",
    uri: "replacement",
  });
});
