import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { MarkdownEditor } from "panelui-taro/markdown-editor";
import type { MarkdownEditorHandle } from "panelui-taro/markdown-editor";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

export const MarkdownEditorShowcase = () => {
  const [value, setValue] = useState("Hello\n\n- Read together\n- Learn words");
  const editor = useRef<MarkdownEditorHandle>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-markdown-editor-result">{value}</Typography>
      <MarkdownEditor ref={editor} value={value} onValueChange={setValue}>
        <MarkdownEditor.Toolbar variant="pill" />
        <MarkdownEditor.Input
          placeholder="Write markdown"
          rows={8}
          accessibilityLabel="Markdown source"
        />
        <MarkdownEditor.Preview />
      </MarkdownEditor>
      <Button
        variant="outline"
        onPress={() => {
          editor.current?.focus();
          editor.current?.setSelection({ end: 5, start: 0 });
        }}
      >
        Select first word
      </Button>
      <Button variant="outline" onPress={() => editor.current?.apply("bold")}>
        Apply bold with handle
      </Button>
      <Button variant="outline" onPress={() => editor.current?.focus()}>
        Focus editor
      </Button>
    </View>
  );
};
