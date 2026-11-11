import { View } from "@tarojs/components";
import { FolderIcon, FileIcon } from "panelui-taro/icons";
import { Tree } from "panelui-taro/tree";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const TreeShowcase = () => {
  const [selected, setSelected] = useState<string | string[]>("");
  const [expanded, setExpanded] = useState<string[]>([]);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">层级树</Typography.Heading>
      <Tree
        value={selected}
        onValueChange={setSelected}
        expanded={expanded}
        onExpandedChange={setExpanded}
        selectionMode="single"
        showLines
      >
        <Tree.Item value="subjects">
          <Tree.Trigger className="panel-tree-parent" accessibilityLabel="科目">
            <Tree.Indicator className="panel-tree-arrow" />
            <Tree.Icon>
              <FolderIcon size={16} />
            </Tree.Icon>
            <Tree.Label>科目</Tree.Label>
          </Tree.Trigger>
          <Tree.Group>
            <Tree.Item value="math">
              <Tree.Trigger
                className="panel-tree-math"
                accessibilityLabel="数学"
              >
                <Tree.Indicator />
                <Tree.Icon>
                  <FileIcon size={16} />
                </Tree.Icon>
                <Tree.Label>数学</Tree.Label>
              </Tree.Trigger>
            </Tree.Item>
            <Tree.Item value="chinese">
              <Tree.Trigger accessibilityLabel="语文">
                <Tree.Indicator />
                <Tree.Label>语文</Tree.Label>
              </Tree.Trigger>
            </Tree.Item>
            <Tree.Item value="disabled" isDisabled>
              <Tree.Trigger accessibilityLabel="暂未开放">
                <Tree.Indicator />
                <Tree.Label>暂未开放</Tree.Label>
              </Tree.Trigger>
            </Tree.Item>
          </Tree.Group>
        </Tree.Item>
      </Tree>
      <Typography.Paragraph id="panel-tree-result">
        展开：{expanded.join(",") || "无"}；选择：{String(selected) || "无"}
      </Typography.Paragraph>
    </View>
  );
};
