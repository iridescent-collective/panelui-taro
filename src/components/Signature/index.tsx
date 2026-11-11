import {
  SignatureToolbar,
  SignatureUndo,
  SignatureRedo,
  SignatureClear,
} from "./controls";
import { SignatureRoot } from "./root";

export { hasSignatureFileSystem } from "./files";
export const hasSignatureRaster = true;
export type {
  SignatureProps,
  SignatureSaveOptions,
  SignatureFile,
  SignatureHandle,
  SignatureToolbarProps,
  SignatureButtonProps,
} from "./types";
export const Signature = Object.assign(SignatureRoot, {
  Clear: SignatureClear,
  Redo: SignatureRedo,
  Toolbar: SignatureToolbar,
  Undo: SignatureUndo,
});
