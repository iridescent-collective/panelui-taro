import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Menu } from "panelui-taro/menu";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const MenuShowcase = () => {
  const [checked, setChecked] = useState(false);
  const [choice, setChoice] = useState("library");
  const [selected, setSelected] = useState("");
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography id="panel-menu-result">
        {JSON.stringify({ checked, choice, selected })}
      </Typography>
      <Menu
        onOpenChange={(open) => {
          if (!open) {
            setSelected((previous) => previous || "closed");
          }
        }}
      >
        <View className="relative flex flex-col gap-[4px] rounded-[48px] p-[12px]">
          <Menu.Background />
          <Menu.Label>Workspace</Menu.Label>
          <Menu.Item
            id="panel-menu-rename"
            description="Edit the display name"
            shortcut="⌘R"
            onSelect={() => setSelected("rename")}
          >
            Rename
          </Menu.Item>
          <Menu.CheckboxItem
            id="panel-menu-check"
            checked={checked}
            onCheckedChange={setChecked}
          >
            Show details
          </Menu.CheckboxItem>
          <Menu.RadioGroup value={choice} onValueChange={setChoice}>
            <Menu.RadioItem
              id="panel-menu-library"
              value="library"
              indicator="dot"
            >
              Library
            </Menu.RadioItem>
            <Menu.RadioItem id="panel-menu-voice" value="voice" indicator="dot">
              Voice messages
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Sub>
            <Menu.SubTrigger id="panel-menu-more">More</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item
                id="panel-menu-export"
                onSelect={() => setSelected("export")}
              >
                Export
              </Menu.Item>
              <Menu.Item disabled>Archive unavailable</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Separator />
          <Menu.Item
            id="panel-menu-delete"
            variant="destructive"
            onSelect={() => setSelected("delete")}
          >
            Delete
          </Menu.Item>
        </View>
      </Menu>
      <Typography>Popover</Typography>
      <Menu>
        <Menu.Trigger>
          <Button id="panel-menu-popover" variant="outline">
            Open menu
          </Button>
        </Menu.Trigger>
        <Menu.Content width={240}>
          <Menu.Label>Actions</Menu.Label>
          <Menu.Item onSelect={() => setSelected("share")}>Share</Menu.Item>
          <Menu.Item
            variant="destructive"
            onSelect={() => setSelected("remove")}
          >
            Remove
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <Typography>Bottom sheet</Typography>
      <Menu presentation="bottom-sheet">
        <Menu.Trigger>
          <Button id="panel-menu-sheet" variant="outline">
            Open sheet menu
          </Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={() => setSelected("send")}>Send</Menu.Item>
          <Menu.CheckboxItem checked={checked} onCheckedChange={setChecked}>
            Show details
          </Menu.CheckboxItem>
        </Menu.Content>
      </Menu>
    </View>
  );
};
