import { FileUploadTrigger } from "./chooser";
import { FileUploadDropzone } from "./dropzone";
import { FileUploadGrid } from "./grid";
import { FileUploadRoot } from "./root";
import { FileUploadItem, FileUploadList } from "./rows";

export { useFileUpload } from "./context";
export { hasFileUploadSource } from "./native";
export {
  describeRules as describeFileUploadRules,
  formatFileSize,
} from "./core";
export { describeFileStatus } from "./rows";
export type {
  FileUploadProps,
  FileUploadFile,
  FileUploadKind,
  FileUploadRejection,
  FileUploadSource,
  FileUploadStatus,
  FileUploadHandler,
  FileUploadHandlerContext,
  FileUploadImageOptions,
  FileUploadTriggerProps,
  FileUploadDropzoneProps,
  FileUploadItemProps,
  FileUploadListProps,
  FileUploadGridProps,
} from "./types";
export const FileUpload = Object.assign(FileUploadRoot, {
  Dropzone: FileUploadDropzone,
  Grid: FileUploadGrid,
  Item: FileUploadItem,
  List: FileUploadList,
  Trigger: FileUploadTrigger,
});
