import { createContext } from "react";

import type { AttachmentState, AttachmentSize } from "./types";

export const AttachmentContext = createContext<{
  state: AttachmentState;
  size: AttachmentSize;
}>({ size: "default", state: "done" });
export const isAttachmentBusy = (state: AttachmentState) =>
  state === "uploading" || state === "processing";
