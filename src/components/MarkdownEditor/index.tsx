import { View } from "@tarojs/components";
import { forwardRef, useRef } from "react";
import type { ComponentRef } from "react";

import { MarkdownEditorContext } from "./context";
import { MarkdownEditorInput } from "./input";
import { MarkdownEditorPreview } from "./preview";
import { MarkdownEditorToolbar } from "./toolbar";
import type { MarkdownEditorHandle, MarkdownEditorProps } from "./types";
import { useMarkdownEditorModel } from "./use-model";
import { markdownEditorVariants } from "./variants";

export type { EditorSelection, EditResult } from "./transforms";
export type {
  MarkdownEditorProps,
  MarkdownEditorHandle,
  MarkdownEditorAction,
  MarkdownEditorMode,
  MarkdownEditorToolbarVariant,
  MarkdownEditorToolbarProps,
  MarkdownEditorInputProps,
  MarkdownEditorPreviewProps,
} from "./types";
const MarkdownEditorRoot = forwardRef<
  MarkdownEditorHandle,
  MarkdownEditorProps
>((props, ref) => {
  const {
    className,
    children,
    placeholder,
    rows,
    avoidKeyboard,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    mode: _mode,
    defaultMode: _defaultMode,
    onModeChange: _onModeChange,
    disabled: _disabled,
    continueLists: _continueLists,
    ...viewProps
  } = props;
  const view = useRef<ComponentRef<typeof View>>(null);
  const model = useMarkdownEditorModel(props, ref, view);
  const slots = markdownEditorVariants();
  return (
    <MarkdownEditorContext.Provider value={model}>
      <View
        {...viewProps}
        ref={view}
        className={slots.root({
          className: `flex flex-col ${className ?? ""}`,
        })}
      >
        {children ?? (
          <>
            <MarkdownEditorToolbar />
            <MarkdownEditorInput
              placeholder={placeholder}
              rows={rows}
              avoidKeyboard={avoidKeyboard}
            />
            <MarkdownEditorPreview />
          </>
        )}
      </View>
    </MarkdownEditorContext.Provider>
  );
});
MarkdownEditorRoot.displayName = "MarkdownEditor";
export const MarkdownEditor = Object.assign(MarkdownEditorRoot, {
  Input: MarkdownEditorInput,
  Preview: MarkdownEditorPreview,
  Toolbar: MarkdownEditorToolbar,
});
