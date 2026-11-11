import type { FileUploadHandlerContext } from "panelui-taro/file-upload";

export interface FixtureUploadJob {
  context: FileUploadHandlerContext;
  resolve: (response: unknown) => void;
  reject: (error: Error) => void;
}
