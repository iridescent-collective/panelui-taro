import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { TagInput } from "panelui-taro/tag-input";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const TagInputShowcase = () => {
  const [tags, setTags] = useState(["阅读", "数学"]);
  const [readOnly, setReadOnly] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [rejection, setRejection] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">TagInput · 多标签输入</Typography.Heading>
      <View className="flex flex-row gap-[16px]">
        <Button variant="outline" onPress={() => setReadOnly(!readOnly)}>
          {readOnly ? "编辑模式" : "只读模式"}
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "启用输入" : "禁用输入"}
        </Button>
      </View>
      <TagInput
        id="panel-tag-input"
        className="panel-tag-field"
        label="学习主题"
        placeholder="输入后用逗号或确认提交"
        value={tags}
        onValueChange={setTags}
        max={4}
        showCount
        clearable
        readOnly={readOnly}
        disabled={disabled}
        onReject={(tag, reason) => setRejection(`${tag} · ${reason}`)}
      />
      <Typography id="panel-tag-result">{JSON.stringify(tags)}</Typography>
      {rejection ? (
        <Typography className="text-[var(--panel-destructive)]">
          {rejection}
        </Typography>
      ) : null}
      <TagInput
        label="Filled · 小尺寸"
        size="sm"
        variant="filled"
        defaultValue={["design", "research"]}
        placeholder="添加标签"
      />
      <TagInput
        label="Large · 溢出"
        size="lg"
        defaultValue={["a", "b", "c"]}
        max={2}
        showCount
        allowOverflow
        errorMessage="数量超出上限"
      />
      <TagInput
        label="只读标签"
        defaultValue={["science", "language"]}
        readOnly
      />
      <TagInput label="禁用标签" defaultValue={["archived"]} disabled />
    </View>
  );
};
