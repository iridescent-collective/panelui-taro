import { View } from "@tarojs/components";
import { getCurrentInstance } from "@tarojs/taro";
import { Select } from "panelui-taro/select";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { PREVIEW_STORIES } from "./catalogue";
import { resolvePreviewStoryId } from "./initial-story";

export const PreviewCatalog = () => {
  const [selectedId, setSelectedId] = useState(() =>
    resolvePreviewStoryId(
      getCurrentInstance().router?.params.story,
      PREVIEW_STORIES
    )
  );
  const selected =
    PREVIEW_STORIES.find((story) => story.id === selectedId) ??
    PREVIEW_STORIES[0];
  const Story = selected.component;
  return (
    <View className="flex flex-col gap-[40px]">
      <Select
        value={selected.id}
        valueLabel={selected.label}
        onValueChange={setSelectedId}
        triggerClassName="panel-preview-story-trigger"
        searchable
        searchPlaceholder="搜索组件"
        title="组件目录"
        presentation="sheet"
      >
        {PREVIEW_STORIES.map((story) => (
          <Select.Item
            key={story.id}
            value={story.id}
            label={story.label}
            className={`panel-preview-option-${story.id}`}
          />
        ))}
      </Select>
      <Typography.Paragraph id="panel-preview-modules" muted>
        {selected.modules.join(" · ")}
      </Typography.Paragraph>
      <View key={selected.id} id={`panel-preview-story-${selected.id}`}>
        <Story />
      </View>
    </View>
  );
};
