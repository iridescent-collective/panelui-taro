import { Badge } from "panelui-taro/badge";
import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { Spinner } from "panelui-taro/spinner";
import { Tree } from "panelui-taro/tree";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
type TreeNodeData = {
  value: string;
  label: string;
  children?: TreeNodeData[];
};
const PROJECT_TREE: TreeNodeData[] = [
  {
    value: "src",
    label: "src",
    children: [
      {
        value: "src/components",
        label: "components",
        children: [
          { value: "src/components/button.tsx", label: "button.tsx" },
          { value: "src/components/tree.tsx", label: "tree.tsx" },
        ],
      },
      {
        value: "src/primitives",
        label: "primitives",
        children: [{ value: "src/primitives/text.tsx", label: "text.tsx" }],
      },
      { value: "src/index.ts", label: "index.ts" },
    ],
  },
  { value: "package.json", label: "package.json" },
  { value: "README.md", label: "README.md" },
];
function TreeNodes({
  nodes,
  expanded,
}: {
  nodes: TreeNodeData[];
  expanded: string[];
}) {
  return (
    <>
      {nodes.map((node) => {
        const isOpen = expanded.includes(node.value);
        return (
          <Tree.Item key={node.value} value={node.value}>
            <Tree.Trigger>
              <Tree.Indicator />
              <Tree.Icon>
                {node.children ? (
                  isOpen ? (
                    <FolderOpenIcon size={15} />
                  ) : (
                    <FolderIcon size={15} />
                  )
                ) : (
                  <FileIcon size={14} />
                )}
              </Tree.Icon>
              <Tree.Label>{node.label}</Tree.Label>
            </Tree.Trigger>
            {node.children ? (
              <Tree.Group>
                <TreeNodes nodes={node.children} expanded={expanded} />
              </Tree.Group>
            ) : null}
          </Tree.Item>
        );
      })}
    </>
  );
}
function TreeFilesDemo({ showLines = false }: { showLines?: boolean }) {
  const [expanded, setExpanded] = useState<string[]>(
    showLines ? ["src", "src/components"] : ["src"]
  );
  return (
    <Tree
      expanded={expanded}
      onExpandedChange={setExpanded}
      showLines={showLines}
    >
      <TreeNodes nodes={PROJECT_TREE} expanded={expanded} />
    </Tree>
  );
}
function TreeSelectionDemo({ mode }: { mode: "single" | "multiple" }) {
  const [selected, setSelected] = useState<string | string[]>(
    mode === "multiple" ? [] : ""
  );
  const [expanded, setExpanded] = useState<string[]>(["src", "src/components"]);
  const chosen = Array.isArray(selected)
    ? selected
    : selected
      ? [selected]
      : [];
  return (
    <View className="w-full gap-3">
      <Tree
        selectionMode={mode}
        value={selected}
        onValueChange={setSelected}
        expanded={expanded}
        onExpandedChange={setExpanded}
        showLines
      >
        <TreeNodes nodes={PROJECT_TREE} expanded={expanded} />
      </Tree>
      <Text size="xs" muted>
        {chosen.length ? chosen.join(", ") : "Nothing selected"}
      </Text>
    </View>
  );
}
const LAZY_CHILDREN: TreeNodeData[] = [
  { value: "archive/2024.zip", label: "2024.zip" },
  { value: "archive/2025.zip", label: "2025.zip" },
];
function TreeLazyDemo() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<TreeNodeData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const handleExpandedChange = (next: string[]) => {
    setExpanded(next);
    if (next.includes("archive") && !loaded && !loading) {
      setLoading(true);
      setTimeout(() => {
        setLoaded(LAZY_CHILDREN);
        setLoading(false);
      }, 900);
    }
  };
  return (
    <Tree expanded={expanded} onExpandedChange={handleExpandedChange} showLines>
      <Tree.Item value="archive" hasChildren>
        <Tree.Trigger>
          <Tree.Indicator />
          <Tree.Icon>
            {expanded.includes("archive") ? (
              <FolderOpenIcon size={15} />
            ) : (
              <FolderIcon size={15} />
            )}
          </Tree.Icon>
          <Tree.Label>archive</Tree.Label>
          <Tree.Actions>{loading ? <Spinner size="sm" /> : null}</Tree.Actions>
        </Tree.Trigger>
        {loaded ? (
          <Tree.Group>
            <TreeNodes nodes={loaded} expanded={expanded} />
          </Tree.Group>
        ) : null}
      </Tree.Item>
      <TreeNodes nodes={PROJECT_TREE.slice(1)} expanded={expanded} />
    </Tree>
  );
}
const NAV_TREE: Array<
  TreeNodeData & {
    count?: number;
  }
> = [
  {
    value: "inbox",
    label: "Inbox",
    children: [
      { value: "inbox/unread", label: "Unread" },
      { value: "inbox/flagged", label: "Flagged" },
    ],
  },
  {
    value: "projects",
    label: "Projects",
    children: [
      { value: "projects/panelui", label: "PanelUI" },
      { value: "projects/docs", label: "Docs" },
    ],
  },
];
const NAV_COUNTS: Record<string, number> = {
  "inbox/unread": 12,
  "inbox/flagged": 3,
  "projects/panelui": 8,
};
function TreeNavDemo() {
  const [active, setActive] = useState<string | string[]>("inbox/unread");
  return (
    <Tree
      size="sm"
      selectionMode="single"
      value={active}
      onValueChange={setActive}
      defaultExpanded={["inbox", "projects"]}
      expandOnPress={false}
    >
      {NAV_TREE.map((section) => (
        <Tree.Item key={section.value} value={section.value}>
          <Tree.Trigger>
            <Tree.Indicator />
            <Tree.Label>{section.label}</Tree.Label>
          </Tree.Trigger>
          <Tree.Group>
            {section.children?.map((child) => (
              <Tree.Item key={child.value} value={child.value}>
                <Tree.Trigger>
                  <Tree.Indicator />
                  <Tree.Label>{child.label}</Tree.Label>
                  <Tree.Actions>
                    {NAV_COUNTS[child.value] ? (
                      <Badge
                        variant="secondary"
                        count={NAV_COUNTS[child.value]}
                      />
                    ) : null}
                  </Tree.Actions>
                </Tree.Trigger>
              </Tree.Item>
            ))}
          </Tree.Group>
        </Tree.Item>
      ))}
    </Tree>
  );
}
export const entry: ComponentEntry = {
  slug: "tree",
  name: "Tree",
  summary: "A hierarchy you can open a level at a time",
  demos: [
    { label: "Default", render: () => <TreeFilesDemo /> },
    { label: "Guide lines", render: () => <TreeFilesDemo showLines /> },
    {
      label: "Single selection",
      render: () => <TreeSelectionDemo mode="single" />,
    },
    {
      label: "Multiple selection",
      render: () => <TreeSelectionDemo mode="multiple" />,
    },
    { label: "Sidebar nav", render: () => <TreeNavDemo /> },
    { label: "Loads when opened", render: () => <TreeLazyDemo /> },
  ],
};
