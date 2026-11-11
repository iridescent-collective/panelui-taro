import type { FileUploadHandler } from "panelui-taro/file-upload";
import { useCallback, useEffect, useRef } from "react";

import type { FixtureUploadJob } from "./type";

export const useFixtureUpload = () => {
  const jobs = useRef(new Map<string, FixtureUploadJob>());
  const upload = useCallback<FileUploadHandler>(
    (file, context) =>
      new Promise((resolve, reject) => {
        const abort = () => {
          jobs.current.delete(file.id);
          reject(new Error("Fixture upload canceled"));
        };
        if (context.signal.aborted) {
          abort();
          return;
        }
        const cleanup = () => {
          context.signal.removeEventListener("abort", abort);
          jobs.current.delete(file.id);
        };
        jobs.current.set(file.id, {
          context,
          reject: (error) => {
            cleanup();
            reject(error);
          },
          resolve: (response) => {
            cleanup();
            resolve(response);
          },
        });
        context.signal.addEventListener("abort", abort, { once: true });
      }),
    []
  );
  useEffect(
    () => () => {
      for (const job of jobs.current.values()) {
        job.reject(new Error("Fixture showcase unmounted"));
      }
    },
    []
  );
  return {
    complete: () => {
      for (const job of jobs.current.values()) {
        job.resolve({ fixture: true });
      }
    },
    fail: () => {
      for (const job of jobs.current.values()) {
        job.reject(new Error("Fixture connection lost. Tap retry."));
      }
    },
    process: () => {
      for (const job of jobs.current.values()) {
        job.context.setProcessing();
      }
    },
    progress: () => {
      for (const job of jobs.current.values()) {
        job.context.onProgress(0.5);
      }
    },
    upload,
  };
};
