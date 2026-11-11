import { useCallback, useEffect, useMemo, useRef } from "react";

import { FileUploadContext } from "./context";
import { libraryMediaTypes } from "./core";
import { pickUploadFiles } from "./native";
import type { FileUploadProps, FileUploadSource } from "./types";
import { useUploadQueue } from "./use-upload-queue";

const DEFAULT_SOURCES: FileUploadSource[] = ["library", "files"];
const DEFAULT_LABELS = {
  camera: "Take photo",
  files: "Browse files",
  library: "Choose from library",
};
export const FileUploadRoot = (props: FileUploadProps) => {
  const queue = useUploadQueue(props);
  const mounted = useRef(true);
  const picking = useRef(false);
  const latest = useRef({ props, queue });
  latest.current = { props, queue };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const pick = useCallback(async (source: FileUploadSource) => {
    const { current } = latest;
    if (current.props.disabled || picking.current) {
      return;
    }
    const maxFiles = current.props.multiple ? current.props.maxFiles : 1;
    const held = current.props.multiple ? current.queue.getFiles().length : 0;
    const remaining =
      maxFiles === undefined ? undefined : Math.max(0, maxFiles - held);
    if (remaining === 0) {
      return;
    }
    picking.current = true;
    try {
      const picked = await pickUploadFiles(source, {
        accept: current.props.accept,
        image: current.props.image,
        multiple: Boolean(current.props.multiple),
        remaining,
      });
      if (picked && mounted.current && !latest.current.props.disabled) {
        latest.current.queue.addFiles(picked);
      }
    } catch (error) {
      if (mounted.current) {
        latest.current.props.onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    } finally {
      picking.current = false;
    }
  }, []);
  const sources = useMemo(
    () =>
      (props.sources ?? DEFAULT_SOURCES).filter((source) => {
        if (source === "files") {
          return true;
        }
        const media = libraryMediaTypes(props.accept);
        return source === "camera"
          ? media.includes("images")
          : media.length > 0;
      }),
    [props.sources, props.accept]
  );
  const context = {
    ...queue,
    accept: props.accept,
    maxSize: props.maxSize,
    pick,
    sourceLabels: { ...DEFAULT_LABELS, ...props.sourceLabels },
    sources,
  };
  return (
    <FileUploadContext.Provider value={context}>
      {props.children}
    </FileUploadContext.Provider>
  );
};
