import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { SelectionMode } from "panelui-taro/selection-mode";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const VALUES = ["library", "voice", "location"];
const LABELS = ["Library", "Voice messages", "Location"];
export const SelectionModeShowcase = () => {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <View className="flex flex-row gap-[16px]">
        <Button
          variant="outline"
          className="panel-selection-enter"
          onPress={() => setActive(!active)}
        >
          {active ? "关闭选择" : "进入选择"}
        </Button>
        <Button
          variant="outline"
          className="panel-selection-sheet"
          onPress={() => setOpen(true)}
        >
          选择面板
        </Button>
      </View>
      <Typography id="panel-selection-result">
        {JSON.stringify({ active, selected, sent })}
      </Typography>
      <SelectionMode
        active={active}
        onActiveChange={setActive}
        selected={selected}
        onSelectedChange={setSelected}
        values={VALUES}
        max={2}
        className="min-h-[620px]"
      >
        <SelectionMode.Header title="Choose" />
        <SelectionMode.Group
          label="Library"
          className="border-[2px] border-solid border-[var(--panel-border)]"
        >
          {VALUES.map((value, index) => (
            <SelectionMode.Item
              key={value}
              id={`panel-selection-${value}`}
              value={value}
            >
              {LABELS[index]}
            </SelectionMode.Item>
          ))}
          <SelectionMode.Item
            value="more"
            disabled
            onPress={() => setSent("More")}
          >
            <Typography>More · ordinary action</Typography>
          </SelectionMode.Item>
        </SelectionMode.Group>
        <SelectionMode.Bar placement="floating">
          <SelectionMode.Action
            id="panel-selection-send"
            exitOnPress
            onPress={(ids) => setSent(ids.join(","))}
          >
            Send
          </SelectionMode.Action>
        </SelectionMode.Bar>
        <SelectionMode.Sheet
          open={open}
          onOpenChange={setOpen}
          title="Share"
          size="auto"
        >
          <SelectionMode.Group label="Options">
            {VALUES.map((value, index) => (
              <SelectionMode.Item
                key={value}
                id={`panel-selection-sheet-${value}`}
                value={value}
              >
                {LABELS[index]}
              </SelectionMode.Item>
            ))}
          </SelectionMode.Group>
          <SelectionMode.Bar>
            <SelectionMode.Action
              onPress={(ids) => {
                setSent(ids.join(","));
                setOpen(false);
              }}
            >
              Share
            </SelectionMode.Action>
          </SelectionMode.Bar>
        </SelectionMode.Sheet>
      </SelectionMode>
    </View>
  );
};
