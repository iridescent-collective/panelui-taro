import { createContext, useContext } from "react";

import type { FileUploadContextValue } from "./types";

export const FileUploadContext = createContext<FileUploadContextValue | null>(
  null
);
export const useFileUpload = (): FileUploadContextValue => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error("useFileUpload must be used inside <FileUpload>.");
  }
  return context;
};
