import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { ContextMenu } from "panelui-taro/context-menu";
import type { ContextMenuTriggerHandle } from "panelui-taro/context-menu";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

export const ContextMenuShowcase = () => {
  const [pressed, setPressed] = useState(0);
  const [nested, setNested] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const trigger = useRef<ContextMenuTriggerHandle>(null);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography id="panel-context-result">
        {JSON.stringify({ checked, disabled, nested, pressed, selected })}
      </Typography>
      <ContextMenu haptics>
        <ContextMenu.Trigger
          ref={trigger}
          id="panel-context-target"
          disabled={disabled}
          haptics
          onPress={() => setPressed((value) => value + 1)}
          accessibilityLabel="Reading note actions"
        >
          <View className="flex flex-col gap-[16px] rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] p-[32px]">
            <Typography weight="semibold">Reading note</Typography>
            <Typography>Hold to open actions. Tap to open the note.</Typography>
            <Button
              id="panel-context-nested"
              variant="outline"
              onPress={() => setNested((value) => value + 1)}
            >
              Nested target
            </Button>
          </View>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Preview />
          <ContextMenu.Label>Note actions</ContextMenu.Label>
          <ContextMenu.Item onSelect={() => setSelected("share")}>
            Share
          </ContextMenu.Item>
          <ContextMenu.CheckboxItem
            checked={checked}
            onCheckedChange={setChecked}
          >
            Keep offline
          </ContextMenu.CheckboxItem>
          <ContextMenu.Separator />
          <ContextMenu.Item
            variant="destructive"
            onSelect={() => setSelected("remove")}
          >
            Remove
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <Button
        id="panel-context-accessible"
        variant="outline"
        disabled={disabled}
        onPress={() => trigger.current?.showMenu()}
      >
        Show note actions
      </Button>
      <Button
        id="panel-context-disabled"
        variant="outline"
        onPress={() => setDisabled((value) => !value)}
      >
        {disabled ? "Enable target" : "Disable target"}
      </Button>
      <ContextMenu>
        <ContextMenu.Trigger
          id="panel-context-row"
          className="flex flex-row items-center gap-[16px] rounded-[24px] border-[2px] border-solid border-[var(--panel-border)] p-[32px]"
          style={{ justifyContent: "space-between" }}
        >
          <Typography>A</Typography>
          <Typography>Horizontal layout</Typography>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Row action</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <Typography>Point anchor without preview</Typography>
      <ContextMenu>
        <ContextMenu.Trigger
          id="panel-context-point"
          className="rounded-[24px] border-[2px] border-solid border-[var(--panel-border)] p-[32px]"
        >
          <Typography>Hold anywhere in this row</Typography>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={() => setSelected("point")}>
            Point action
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    </View>
  );
};
