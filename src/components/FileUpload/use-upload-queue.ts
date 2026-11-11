import { useCallback, useEffect, useRef, useState } from "react";

import { useControllableState } from "../../primitives/controllable-state";
import { isActive, nextToStart, partitionFiles } from "./core";
import type {
  FileUploadFile,
  FileUploadHandlerContext,
  FileUploadProps,
  FileUploadRejection,
  FileUploadRules,
} from "./types";

const EMPTY_FILES: FileUploadFile[] = [];
const sourceFingerprint = (file: FileUploadFile): string =>
  JSON.stringify([
    file.uri,
    file.name,
    file.mimeType,
    file.size,
    file.kind,
    file.width,
    file.height,
  ]);
const notifyAbortListener = (notify: () => void): boolean => {
  try {
    notify();
    return true;
  } catch {
    return false;
  }
};
const makeController = (): Pick<AbortController, "signal" | "abort"> => {
  if (typeof AbortController !== "undefined") {
    return new AbortController();
  }
  let aborted = false;
  const listeners = new Set<EventListenerOrEventListenerObject>();
  const signal = {
    get aborted() {
      return aborted;
    },
    addEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject | null
    ) => {
      if (type === "abort" && listener) {
        listeners.add(listener);
      }
    },
    dispatchEvent: () => true,
    onabort: null as AbortSignal["onabort"],
    get reason() {
      return aborted ? new Error("Upload canceled") : undefined;
    },
    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject | null
    ) => {
      if (type === "abort" && listener) {
        listeners.delete(listener);
      }
    },
    throwIfAborted: () => {
      if (aborted) {
        throw new Error("Upload canceled");
      }
    },
  } as AbortSignal;
  return {
    abort: () => {
      if (aborted) {
        return;
      }
      aborted = true;
      const event = {
        currentTarget: signal,
        target: signal,
        type: "abort",
      } as unknown as Event;
      notifyAbortListener(() => signal.onabort?.(event));
      for (const listener of listeners) {
        if (typeof listener === "function") {
          notifyAbortListener(() => listener.call(signal, event));
        } else {
          notifyAbortListener(() => listener.handleEvent(event));
        }
      }
      listeners.clear();
    },
    signal,
  };
};
export const useUploadQueue = (props: FileUploadProps) => {
  const { value, setValue } = useControllableState({
    defaultValue: props.defaultValue ?? EMPTY_FILES,
    onChange: props.onValueChange,
    value: props.value,
  });
  const latest = useRef(value);
  const seen = useRef(value);
  if (seen.current !== value) {
    latest.current = value;
    seen.current = value;
  }
  const options = useRef(props);
  options.current = props;
  const alive = useRef(true);
  const jobs = useRef(
    new Map<string, Pick<AbortController, "signal" | "abort">>()
  );
  const fingerprints = useRef(new Map<string, string>());
  const pending = useRef(new Map<string, number>());
  const scheduled = useRef<(() => void) | null>(null);
  const [revision, setRevision] = useState(0);
  const [rejections, setRejections] = useState<FileUploadRejection[]>([]);
  const commit = useCallback(
    (change: (files: FileUploadFile[]) => FileUploadFile[]) => {
      if (!alive.current) {
        return;
      }
      const next = change(latest.current);
      if (next === latest.current) {
        return;
      }
      latest.current = next;
      setValue(next);
      setRevision((n) => n + 1);
    },
    [setValue]
  );
  const patch = useCallback(
    (id: string, fields: Partial<FileUploadFile>) =>
      commit((files) =>
        files.some((f) => f.id === id)
          ? files.map((f) => (f.id === id ? { ...f, ...fields } : f))
          : files
      ),
    [commit]
  );
  const stop = useCallback((id: string) => {
    jobs.current.get(id)?.abort();
    jobs.current.delete(id);
    fingerprints.current.delete(id);
    pending.current.delete(id);
  }, []);
  const flush = useCallback(() => {
    scheduled.current = null;
    const batch = new Map(pending.current);
    pending.current.clear();
    if (!batch.size) {
      return;
    }
    commit((files) =>
      files.map((f) =>
        batch.has(f.id) &&
        f.status === "uploading" &&
        fingerprints.current.get(f.id) === sourceFingerprint(f)
          ? { ...f, progress: batch.get(f.id) }
          : f
      )
    );
  }, [commit]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      for (const controller of jobs.current.values()) {
        controller.abort();
      }
      latest.current = latest.current.map((file) =>
        jobs.current.has(file.id) && isActive(file.status)
          ? { ...file, progress: 0, status: "queued" }
          : file
      );
      jobs.current.clear();
      fingerprints.current.clear();
      pending.current.clear();
      scheduled.current?.();
      scheduled.current = null;
    };
  }, []);
  useEffect(() => {
    for (const [id] of jobs.current) {
      const f = latest.current.find((file) => file.id === id);
      if (
        !f ||
        !isActive(f.status) ||
        fingerprints.current.get(id) !== sourceFingerprint(f)
      ) {
        stop(id);
      }
    }
    const handler = options.current.upload;
    if (!handler) {
      return;
    }
    for (const id of nextToStart(latest.current, props.concurrency ?? 2)) {
      if (jobs.current.has(id)) {
        continue;
      }
      const file = latest.current.find((f) => f.id === id);
      if (!file) {
        continue;
      }
      const controller = makeController();
      jobs.current.set(id, controller);
      const fingerprint = sourceFingerprint(file);
      fingerprints.current.set(id, fingerprint);
      const valid = () =>
        alive.current &&
        !controller.signal.aborted &&
        jobs.current.get(id) === controller &&
        latest.current.some(
          (current) =>
            current.id === id &&
            isActive(current.status) &&
            sourceFingerprint(current) === fingerprint
        );
      patch(id, { error: undefined, progress: 0, status: "uploading" });
      const context: FileUploadHandlerContext = {
        onProgress: (progress) => {
          if (!valid() || !Number.isFinite(progress)) {
            return;
          }
          pending.current.set(id, Math.min(1, Math.max(0, progress)));
          if (scheduled.current) {
            return;
          }
          if (
            typeof requestAnimationFrame === "function" &&
            typeof cancelAnimationFrame === "function"
          ) {
            const handle = requestAnimationFrame(flush);
            scheduled.current = () => cancelAnimationFrame(handle);
          } else {
            const handle = setTimeout(flush, 16);
            scheduled.current = () => clearTimeout(handle);
          }
        },
        setProcessing: () => {
          if (valid()) {
            pending.current.delete(id);
            patch(id, { progress: 1, status: "processing" });
          }
        },
        signal: controller.signal,
      };
      void (async () => {
        try {
          if (!valid()) {
            return;
          }
          const response = await handler(
            { ...file, progress: 0, status: "uploading" },
            context
          );
          if (!valid()) {
            return;
          }
          jobs.current.delete(id);
          fingerprints.current.delete(id);
          pending.current.delete(id);
          patch(id, {
            error: undefined,
            progress: 1,
            response,
            status: "done",
          });
          const done = latest.current.find((f) => f.id === id);
          if (done) {
            options.current.onUploadComplete?.(done);
          }
        } catch (error) {
          if (!valid()) {
            return;
          }
          jobs.current.delete(id);
          fingerprints.current.delete(id);
          pending.current.delete(id);
          patch(id, {
            error:
              error instanceof Error && error.message
                ? error.message
                : "Upload failed",
            status: "error",
          });
        }
      })();
    }
  }, [value, revision, props.concurrency, props.upload, patch, stop, flush]);
  const addFiles = useCallback(
    (candidates: readonly FileUploadFile[]) => {
      const { current } = options;
      if (current.disabled || !alive.current) {
        return;
      }
      const maxFiles = current.multiple ? current.maxFiles : 1;
      const result = partitionFiles(
        candidates,
        current.multiple ? latest.current.length : 0,
        {
          accept: current.accept,
          maxFiles,
          maxSize: current.maxSize,
          minSize: current.minSize,
          validate: current.validate,
        }
      );
      setRejections(result.rejected);
      if (result.rejected.length) {
        current.onReject?.(result.rejected);
      }
      if (!result.accepted.length) {
        return;
      }
      const added = result.accepted.map((f) => ({
        ...f,
        status:
          current.upload && current.autoUpload !== false
            ? ("queued" as const)
            : ("idle" as const),
      }));
      if (current.multiple) {
        commit((files) => [...files, ...added]);
      } else {
        for (const f of latest.current) {
          stop(f.id);
        }
        commit(() => added.slice(0, 1));
      }
    },
    [commit, stop]
  );
  const remove = useCallback(
    (id: string) => {
      if (options.current.disabled) {
        return;
      }
      stop(id);
      setRejections([]);
      commit((files) => files.filter((f) => f.id !== id));
    },
    [commit, stop]
  );
  const cancel = useCallback(
    (id: string) => {
      if (options.current.disabled) {
        return;
      }
      const file = latest.current.find((f) => f.id === id);
      if (!file || !(isActive(file.status) || file.status === "queued")) {
        return;
      }
      stop(id);
      patch(id, { progress: undefined, status: "canceled" });
    },
    [patch, stop]
  );
  const upload = useCallback(
    (id?: string) => {
      if (options.current.disabled || !options.current.upload) {
        return;
      }
      commit((files) =>
        files.map((f) =>
          (id === undefined || id === f.id) &&
          ["idle", "canceled", "error"].includes(f.status)
            ? { ...f, error: undefined, progress: 0, status: "queued" }
            : f
        )
      );
    },
    [commit]
  );
  const retry = useCallback((id: string) => upload(id), [upload]);
  const clear = useCallback(() => {
    if (options.current.disabled) {
      return;
    }
    for (const id of jobs.current.keys()) {
      stop(id);
    }
    setRejections([]);
    commit(() => []);
  }, [commit, stop]);
  const getFiles = useCallback(() => latest.current, []);
  const multiple = props.multiple ?? false;
  const maxFiles = multiple ? props.maxFiles : 1;
  const disabled = props.disabled ?? false;
  const full = multiple && maxFiles !== undefined && value.length >= maxFiles;
  const rules: FileUploadRules = {
    accept: props.accept,
    maxFiles,
    maxSize: props.maxSize,
    minSize: props.minSize,
    validate: props.validate,
  };
  return {
    addFiles,
    busy: value.some((f) => isActive(f.status)),
    canAddMore: !disabled && !full,
    cancel,
    clear,
    disabled,
    files: value,
    full,
    getFiles,
    hasUpload: props.upload !== undefined,
    invalid: props.invalid ?? false,
    maxFiles,
    multiple,
    rejections,
    remove,
    retry,
    rules,
    upload,
  };
};
