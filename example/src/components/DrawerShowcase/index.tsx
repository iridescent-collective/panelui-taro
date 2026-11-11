import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Direction } from "panelui-taro/direction";
import { Drawer } from "panelui-taro/drawer";
import type { DrawerSide, DrawerSize } from "panelui-taro/drawer";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const SIDES: DrawerSide[] = ["start", "end", "top", "bottom"];
const SIZES: DrawerSize[] = ["sm", "md", "lg", "full"];
export const DrawerShowcase = () => {
  const [side, setSide] = useState<DrawerSide>("start");
  const [size, setSize] = useState<DrawerSize>("md");
  const [rtl, setRtl] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-drawer-result">
        {JSON.stringify({ open, rtl, side, size })}
      </Typography>
      <View className="flex flex-row flex-wrap gap-[16px]">
        {SIDES.map((value) => (
          <Button
            key={value}
            variant={side === value ? "primary" : "outline"}
            onPress={() => setSide(value)}
          >
            {value}
          </Button>
        ))}
      </View>
      <View className="flex flex-row flex-wrap gap-[16px]">
        {SIZES.map((value) => (
          <Button
            key={value}
            variant={size === value ? "primary" : "outline"}
            onPress={() => setSize(value)}
          >
            {value}
          </Button>
        ))}
      </View>
      <Button
        id="panel-drawer-direction"
        variant="outline"
        onPress={() => setRtl((value) => !value)}
      >
        {rtl ? "LTR direction" : "RTL direction"}
      </Button>
      <Direction dir={rtl ? "rtl" : "ltr"}>
        <Drawer open={open} onOpenChange={setOpen}>
          <Drawer.Trigger>
            <Button id="panel-drawer-open">Open drawer</Button>
          </Drawer.Trigger>
          <Drawer.Content side={side} size={size}>
            <Drawer.Header title="Workspace" description="Choose a project" />
            <Drawer.Body>
              <View className="flex flex-col gap-[24px]">
                {Array.from({ length: 12 }, (_, index) => (
                  <View
                    key={index}
                    className="rounded-[24px] border-[2px] border-solid border-[var(--panel-border)] p-[24px]"
                  >
                    <Typography>Project {index + 1}</Typography>
                  </View>
                ))}
              </View>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close>
                <Button className="flex-1">Done</Button>
              </Drawer.Close>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </Direction>
    </View>
  );
};
