import type { ViewProps } from "@tarojs/components";
import type { ReactElement, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

export interface FileUploadHandlerContext {
  signal: AbortSignal;
  onProgress: (progress: number) => void;
  setProcessing: () => void;
}
export type FileUploadHandler = (
  file: FileUploadFile,
  context: FileUploadHandlerContext
) => Promise<unknown>;
export interface FileUploadImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  crop?: { aspect: [number, number] };
}
export interface FileUploadProps {
  value?: FileUploadFile[];
  defaultValue?: FileUploadFile[];
  onValueChange?: (files: FileUploadFile[]) => void;
  sources?: FileUploadSource[];
  accept?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  validate?: (file: FileUploadFile) => string | null | undefined;
  onReject?: (rejections: FileUploadRejection[]) => void;
  onError?: (error: Error) => void;
  image?: FileUploadImageOptions;
  upload?: FileUploadHandler;
  concurrency?: number;
  autoUpload?: boolean;
  onUploadComplete?: (file: FileUploadFile) => void;
  sourceLabels?: Partial<Record<FileUploadSource, string>>;
  disabled?: boolean;
  invalid?: boolean;
  children?: ReactNode;
}
export interface FileUploadContextValue {
  files: FileUploadFile[];
  sources: FileUploadSource[];
  sourceLabels: Record<FileUploadSource, string>;
  accept?: string[];
  maxFiles?: number;
  maxSize?: number;
  multiple: boolean;
  disabled: boolean;
  invalid: boolean;
  canAddMore: boolean;
  hasUpload: boolean;
  rejections: FileUploadRejection[];
  pick: (source: FileUploadSource) => Promise<void>;
  remove: (id: string) => void;
  cancel: (id: string) => void;
  retry: (id: string) => void;
  upload: (id?: string) => void;
  clear: () => void;
}
export interface FileUploadTriggerProps {
  children: ReactElement;
}
export interface FileUploadDropzoneProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}
export interface FileUploadItemProps {
  file: FileUploadFile;
  className?: string;
  size?: "default" | "sm";
  nameLength?: number;
}
export interface FileUploadListProps extends ViewProps {
  className?: string;
  horizontal?: boolean;
  size?: "default" | "sm";
  renderItem?: (file: FileUploadFile) => ReactNode;
  empty?: ReactNode;
}
export interface FileUploadGridProps extends ViewProps {
  className?: string;
  columns?: number;
  horizontal?: boolean;
  tileSize?: number;
  gap?: number;
  radius?: number;
  cover?: boolean;
  placeholders?: boolean;
  addLabel?: string;
  hideAdd?: boolean;
}
export type FileUploadSource = "camera" | "library" | "files";
export type FileUploadStatus =
  | "idle"
  | "queued"
  | "uploading"
  | "processing"
  | "done"
  | "error"
  | "canceled";
export type FileUploadKind = "image" | "video" | "document";
export interface FileUploadFile {
  id: string;
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  kind: FileUploadKind;
  status: FileUploadStatus;
  progress?: number;
  error?: string;
  response?: unknown;
}
export interface FileUploadRejection {
  file: Pick<FileUploadFile, "name" | "size" | "mimeType" | "uri">;
  reason: "type" | "size" | "count" | "custom";
  message: string;
}
export interface FileUploadRules {
  accept?: readonly string[];
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  validate?: (file: FileUploadFile) => string | null | undefined;
}
