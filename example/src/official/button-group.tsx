import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { ButtonGroup } from "panelui-taro/button-group";
import {
  BookmarkIcon,
  CopyIcon,
  CrosshairIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  ImageIcon,
  MaximizeIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  RotateCwIcon,
  SearchIcon,
  SendIcon,
  ShareNodesIcon,
  StarIcon,
  TrashIcon,
} from "panelui-taro/icons";
import { Popover } from "panelui-taro/popover";
import { Text } from "panelui-taro/primitives/text";
import { useToast } from "panelui-taro/toast";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const LIBRARY_VIEWS = [
  { value: "files", label: "Files", icon: FileIcon },
  { value: "media", label: "Media", icon: ImageIcon },
  { value: "saved", label: "Saved", icon: BookmarkIcon },
] as const;
function ButtonGroupViewsDemo() {
  const [view, setView] = useState<string>("media");
  return (
    <ButtonGroup size="sm">
      {LIBRARY_VIEWS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={view === value ? "secondary" : "ghost"}
          startContent={<Icon size={15} />}
          labelClassName={view === value ? "font-semibold" : undefined}
          onPress={() => setView(value)}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
function ButtonGroupPlanDemo() {
  const [plan, setPlan] = useState("year");
  return (
    <ButtonGroup fullWidth>
      {[
        { value: "month", label: "Monthly" },
        { value: "year", label: "Annual" },
        { value: "forever", label: "One-off" },
      ].map(({ value, label }) => (
        <Button
          key={value}
          variant={plan === value ? "secondary" : "ghost"}
          onPress={() => setPlan(value)}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
function ButtonGroupSplitDemo() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const pick = (what: string) => {
    setOpen(false);
    toast.show({ variant: "success", label: what, duration: 2000 });
  };
  return (
    <ButtonGroup variant="outline">
      <Button
        startContent={<SendIcon size={16} />}
        onPress={() => pick("Publishing now")}
      >
        Publish
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button size="icon" accessibilityLabel="More ways to publish">
            <ChevronDownIcon size={16} />
          </Button>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-56 p-1.5">
          <Button
            variant="ghost"
            fullWidth
            className="justify-start"
            onPress={() => pick("Scheduled for tonight")}
          >
            Schedule for later
          </Button>
          <Button
            variant="ghost"
            fullWidth
            className="justify-start"
            onPress={() => pick("Saved as a draft")}
          >
            Save as draft
          </Button>
        </Popover.Content>
      </Popover>
    </ButtonGroup>
  );
}
function ButtonGroupStatesDemo() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1600);
  };
  return (
    <View className="w-full items-center gap-4">
      <ButtonGroup variant="outline">
        <Button
          startContent={<PencilIcon size={16} />}
          onPress={demoAction("Rename")}
        >
          Rename
        </Button>
        <Button
          startContent={<CopyIcon size={16} />}
          onPress={demoAction("Duplicate")}
        >
          Duplicate
        </Button>

        <Button startContent={<TrashIcon size={16} />} disabled>
          Remove
        </Button>
      </ButtonGroup>

      <ButtonGroup variant="outline">
        <Button loading={saving} onPress={save}>
          {saving ? "Saving" : "Save layout"}
        </Button>
        <Button
          size="icon"
          accessibilityLabel="Revert"
          onPress={demoAction("Revert")}
        >
          <RotateCcwIcon size={16} />
        </Button>
      </ButtonGroup>
    </View>
  );
}
function ButtonGroupCountDemo() {
  const [watching, setWatching] = useState(false);
  const [stars, setStars] = useState(148);
  return (
    <View className="w-full items-center gap-4">
      <ButtonGroup variant="outline">
        <Button
          startContent={<EyeIcon size={16} />}
          endContent={<Badge variant="secondary" count={watching ? 25 : 24} />}
          onPress={() => setWatching((on) => !on)}
        >
          {watching ? "Watching" : "Watch"}
        </Button>
        <Button
          size="icon"
          accessibilityLabel="Watch options"
          onPress={demoAction("Watch options")}
        >
          <ChevronDownIcon size={16} />
        </Button>
      </ButtonGroup>

      <ButtonGroup variant="outline">
        <Button
          startContent={<StarIcon size={16} />}
          endContent={<Badge variant="warning" count={stars} />}
          onPress={() => setStars((n) => n + 1)}
        >
          Star
        </Button>
        <Button
          size="icon"
          accessibilityLabel="Star options"
          onPress={demoAction("Star options")}
        >
          <ChevronDownIcon size={16} />
        </Button>
      </ButtonGroup>
    </View>
  );
}
function ButtonGroupVerticalDemo() {
  return (
    <View className="w-full flex-row items-start justify-center gap-6">
      <ButtonGroup orientation="vertical" variant="outline" size="icon">
        <Button accessibilityLabel="Zoom in" onPress={demoAction("Zoom in")}>
          <PlusIcon size={16} />
        </Button>
        <Button accessibilityLabel="Zoom out" onPress={demoAction("Zoom out")}>
          <MinusIcon size={16} />
        </Button>
        <Button
          accessibilityLabel="Fit to screen"
          onPress={demoAction("Fit to screen")}
        >
          <MaximizeIcon size={16} />
        </Button>
        <Button accessibilityLabel="Recentre" onPress={demoAction("Recentre")}>
          <CrosshairIcon size={16} />
        </Button>
      </ButtonGroup>

      <ButtonGroup orientation="vertical" variant="outline" size="icon">
        <Button accessibilityLabel="Undo" onPress={demoAction("Undo")}>
          <RotateCcwIcon size={16} />
        </Button>
        <Button accessibilityLabel="Redo" onPress={demoAction("Redo")}>
          <RotateCwIcon size={16} />
        </Button>
      </ButtonGroup>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "button-group",
  name: "ButtonGroup",
  summary: "Several buttons drawn as one control",
  demos: [
    { label: "A view switcher", render: () => <ButtonGroupViewsDemo /> },
    { label: "Sharing the row", render: () => <ButtonGroupPlanDemo /> },
    { label: "A split action", render: () => <ButtonGroupSplitDemo /> },
    { label: "Counts in a segment", render: () => <ButtonGroupCountDemo /> },
    { label: "Busy and unavailable", render: () => <ButtonGroupStatesDemo /> },
    { label: "Down the side", render: () => <ButtonGroupVerticalDemo /> },
    {
      label: "Not joined",
      render: () => (
        <View className="w-full items-center gap-4">
          <ButtonGroup attached={false} variant="outline" size="sm">
            <Button
              startContent={<SearchIcon size={15} />}
              onPress={demoAction("Find")}
            >
              Find
            </Button>
            <Button
              startContent={<DownloadIcon size={15} />}
              onPress={demoAction("Export")}
            >
              Export
            </Button>
            <Button
              startContent={<ShareNodesIcon size={15} />}
              onPress={demoAction("Share")}
            >
              Share
            </Button>
          </ButtonGroup>
          <Text size="xs" muted>
            attached={"{false}"}
          </Text>
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full items-center gap-4">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
            <ButtonGroup key={size} size={size} variant="outline">
              <Button onPress={demoAction("Left")}>Left</Button>
              <Button onPress={demoAction("Middle")}>Middle</Button>
              <Button onPress={demoAction("Right")}>Right</Button>
            </ButtonGroup>
          ))}
        </View>
      ),
    },
  ],
};
