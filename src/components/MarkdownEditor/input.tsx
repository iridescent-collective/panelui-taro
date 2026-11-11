import { forwardRef, useCallback } from "react";

import { cn } from "../../lib/utils";
import type { InputHandle } from "../Input/types";
import { Textarea } from "../Textarea";
import { useMarkdownEditor } from "./context";
import type { MarkdownEditorInputProps } from "./types";

const readSelection = (detail: unknown) => {
  if (
    !detail ||
    typeof detail !== "object" ||
    !("selectionStart" in detail) ||
    !("selectionEnd" in detail)
  ) {
    return null;
  }
  const { selectionStart, selectionEnd } = detail;
  if (
    typeof selectionStart !== "number" ||
    typeof selectionEnd !== "number" ||
    !Number.isFinite(selectionStart) ||
    !Number.isFinite(selectionEnd)
  ) {
    return null;
  }
  return { end: selectionEnd, start: selectionStart };
};
export const MarkdownEditorInput = forwardRef<
  InputHandle,
  MarkdownEditorInputProps
>(({ className, rows = 8, onInput, onSelectionChange, ...props }, ref) => {
  const {
    value,
    mode,
    pending,
    setSelection,
    clearPending,
    onChangeText,
    registerField,
    disabled,
  } = useMarkdownEditor();
  const attach = useCallback(
    (field: InputHandle | null) => {
      registerField(field);
      if (typeof ref === "function") {
        ref(field);
      } else if (ref) {
        ref.current = field;
      }
    },
    [ref, registerField]
  );
  if (mode !== "write") {
    return null;
  }
  return (
    <Textarea
      ref={attach}
      {...props}
      value={value}
      onInput={(event) => {
        const { cursor, value: next } = event.detail;
        const replacement = onChangeText(next, cursor);
        return onInput?.(event) ?? replacement;
      }}
      selectionStart={pending?.start}
      selectionEnd={pending?.end}
      onSelectionChange={(event) => {
        const selection = readSelection(event.detail);
        if (selection) {
          setSelection(selection);
          if (
            pending &&
            selection.start === pending.start &&
            selection.end === pending.end
          ) {
            clearPending();
          }
        }
        onSelectionChange?.(event);
      }}
      disabled={disabled}
      rows={rows}
      className={cn("font-mono", className)}
    />
  );
});
MarkdownEditorInput.displayName = "MarkdownEditor.Input";
