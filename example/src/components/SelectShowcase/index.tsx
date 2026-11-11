import { View } from "@tarojs/components";
import { Select } from "panelui-taro/select";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const SUBJECT_OPTIONS = [
  <Select.Group key="primary" label="小学">
    <Select.Item value="math" label="数学" />
    <Select.Item value="chinese" label="语文" />
  </Select.Group>,
  <Select.Group key="extended" label="扩展">
    <Select.Item value="english" label="英语" />
    <Select.Item value="closed" label="暂未开放" disabled />
  </Select.Group>,
];
const SUBJECT_LABELS: Record<string, string> = {
  chinese: "语文",
  english: "英语",
  math: "数学",
};
export const SelectShowcase = () => {
  const [value, setValue] = useState<string>();
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">选择器</Typography.Heading>
      <Select
        valueLabel={value ? SUBJECT_LABELS[value] : undefined}
        value={value}
        onValueChange={setValue}
        presentation="overlay"
        triggerClassName="panel-select-overlay"
        searchable
        placeholder="浮层选择科目"
        searchPlaceholder="搜索科目"
        emptyMessage="没有匹配项"
      >
        {SUBJECT_OPTIONS}
      </Select>
      <Select
        valueLabel={value ? SUBJECT_LABELS[value] : undefined}
        value={value}
        onValueChange={setValue}
        triggerClassName="panel-select-sheet"
        title="选择科目"
        searchable
        searchPlaceholder="搜索科目"
        placeholder="底部选择科目"
      >
        {SUBJECT_OPTIONS}
      </Select>
      <Select
        valueLabel={value ? SUBJECT_LABELS[value] : undefined}
        value={value}
        onValueChange={setValue}
        presentation="inline"
        triggerClassName="panel-select-inline"
        placeholder="展开选择科目"
      >
        {SUBJECT_OPTIONS}
      </Select>
      <Select native value={value} onValueChange={setValue}>
        <Select.Item value="math" label="数学" />
        <Select.Item value="chinese" label="语文" />
        <Select.Item value="english" label="英语" />
      </Select>
      <Typography.Paragraph id="panel-select-result">
        当前：{value ?? "未选择"}
      </Typography.Paragraph>
    </View>
  );
};
