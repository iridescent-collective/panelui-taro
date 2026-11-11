import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text } from "../primitives/Text";
import { Response } from "../Response";
import { useMarkdownEditor } from "./context";
import type { MarkdownEditorPreviewProps } from "./types";
import { markdownEditorVariants } from "./variants";

export const MarkdownEditorPreview = forwardRef<
  ComponentRef<typeof View>,
  MarkdownEditorPreviewProps
>(({ className, emptyText = "Nothing to preview yet.", ...props }, ref) => {
  const { value, mode } = useMarkdownEditor();
  const slots = markdownEditorVariants();
  if (mode !== "preview") {
    return null;
  }
  return (
    <View {...props} ref={ref} className={slots.preview({ className })}>
      {value.trim() ? (
        <Response>{value}</Response>
      ) : (
        <Text size="sm" muted className={slots.empty()}>
          {emptyText}
        </Text>
      )}
    </View>
  );
});
MarkdownEditorPreview.displayName = "MarkdownEditor.Preview";
