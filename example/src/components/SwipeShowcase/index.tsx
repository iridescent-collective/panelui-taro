import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Direction } from "panelui-taro/direction";
import { TrashIcon, PencilIcon } from "panelui-taro/icons";
import { Swipe } from "panelui-taro/swipe";
import type {
  SwipeHandle,
  SwipeOpenSide,
} from "panelui-taro/swipe";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const ROWS = ["Reading plan", "Voice message", "Learning profile"];
export const SwipeShowcase = () => {
  const first = useRef<SwipeHandle>(null);
  const [rtl, setRtl] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [opened, setOpened] = useState<Record<string, SwipeOpenSide>>({});
  const [action, setAction] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-swipe-result">
        {JSON.stringify({ action, disabled, opened, rtl })}
      </Typography>
      <Direction dir={rtl ? "rtl" : "ltr"}>
        <Swipe.Group className="flex flex-col gap-[24px]">
          {ROWS.map((label, index) => (
            <Swipe
              key={label}
              ref={index === 0 ? first : undefined}
              disabled={disabled}
              haptics
              className="rounded-[24px]"
              onOpenChange={(side) =>
                setOpened((value) => ({ ...value, [label]: side }))
              }
            >
              <Swipe.Start>
                <Swipe.Action
                  label="Pin"
                  color="info"
                  icon={<PencilIcon />}
                  onPress={() => setAction(`Pin ${label}`)}
                />
              </Swipe.Start>
              <Swipe.End>
                <Swipe.Action
                  label="Delete"
                  color="destructive"
                  icon={<TrashIcon />}
                  onPress={() => setAction(`Delete ${label}`)}
                />
              </Swipe.End>
              <View className="border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[32px]">
                <Typography>{label}</Typography>
              </View>
            </Swipe>
          ))}
        </Swipe.Group>
      </Direction>
      <Button
        id="panel-swipe-open"
        variant="outline"
        onPress={() => first.current?.open("end")}
      >
        Open first end
      </Button>
      <Button
        id="panel-swipe-close"
        variant="outline"
        onPress={() => first.current?.close()}
      >
        Close first
      </Button>
      <Button
        id="panel-swipe-direction"
        variant="outline"
        onPress={() => setRtl((value) => !value)}
      >
        {rtl ? "LTR rows" : "RTL rows"}
      </Button>
      <Button
        id="panel-swipe-disabled"
        variant="outline"
        onPress={() => setDisabled((value) => !value)}
      >
        {disabled ? "Enable drag" : "Disable drag"}
      </Button>
    </View>
  );
};
