import {
  BellIcon,
  PlusSquareIcon,
  ShareNodesIcon,
  ShieldCheckIcon,
} from "panelui-taro/icons";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "panelui-taro/toggle-button";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ToggleButtonDemo() {
  const [liked, setLiked] = useState(false);
  return (
    <View className="w-full gap-3">
      <ToggleButton defaultSelected>Follow</ToggleButton>

      <ToggleButton selected={liked} onSelectedChange={setLiked}>
        <BellIcon size={16} />
        <ToggleButton.Label>
          {liked ? "Subscribed" : "Subscribe"}
        </ToggleButton.Label>
      </ToggleButton>

      <ToggleButton variant="ghost" iconOnly accessibilityLabel="Save">
        <PlusSquareIcon size={18} />
      </ToggleButton>
    </View>
  );
}
function ToggleButtonToolbarDemo() {
  const [marks, setMarks] = useState<string[]>(["shield"]);
  return (
    <View className="w-full gap-3">
      <ToggleButtonGroup
        selectionMode="multiple"
        variant="ghost"
        value={marks}
        onValueChange={setMarks}
      >
        <ToggleButton id="shield" iconOnly accessibilityLabel="Protected">
          <ShieldCheckIcon size={18} />
        </ToggleButton>
        <ToggleButton id="bell" iconOnly accessibilityLabel="Notify">
          <BellIcon size={18} />
        </ToggleButton>
        <ToggleButton id="share" iconOnly accessibilityLabel="Shared">
          <ShareNodesIcon size={18} />
        </ToggleButton>
      </ToggleButtonGroup>
      <Text size="sm" muted>
        On: {marks.length ? marks.join(", ") : "nothing"}
      </Text>
    </View>
  );
}
function ToggleButtonSingleDemo() {
  const [view, setView] = useState<string[]>(["day"]);
  return (
    <View className="w-full gap-3">
      <ToggleButtonGroup
        selectionMode="single"
        value={view}
        onValueChange={setView}
      >
        <ToggleButton id="day">Day</ToggleButton>
        <ToggleButton id="week">Week</ToggleButton>
        <ToggleButton id="month">Month</ToggleButton>
      </ToggleButtonGroup>
      <Text size="sm" muted>
        Showing: {view[0] ?? "nothing"}
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "toggle-button",
  name: "ToggleButton",
  summary: "A button that stays down",
  demos: [
    { label: "On its own", render: () => <ToggleButtonDemo /> },
    { label: "A toolbar of marks", render: () => <ToggleButtonToolbarDemo /> },
    { label: "An either-or choice", render: () => <ToggleButtonSingleDemo /> },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-3">
          <ToggleButtonGroup defaultValue={["xs"]} size="xs">
            <ToggleButton id="xs">Extra small</ToggleButton>
            <ToggleButton id="xs2">Extra small</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup defaultValue={["s"]} size="sm">
            <ToggleButton id="s">Small</ToggleButton>
            <ToggleButton id="s2">Small</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup defaultValue={["m"]}>
            <ToggleButton id="m">Medium</ToggleButton>
            <ToggleButton id="m2">Medium</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup defaultValue={["l"]} size="lg">
            <ToggleButton id="l">Large</ToggleButton>
            <ToggleButton id="l2">Large</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup defaultValue={["xl"]} size="xl">
            <ToggleButton id="xl">Extra large</ToggleButton>
            <ToggleButton id="xl2">Extra large</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButton disabled defaultSelected>
            Disabled
          </ToggleButton>
        </View>
      ),
    },
  ],
};
