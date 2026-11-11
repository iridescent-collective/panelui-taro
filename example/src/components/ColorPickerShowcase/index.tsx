import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { ColorPicker } from "panelui-taro/color-picker";
import { Direction } from "panelui-taro/direction";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const COLORS = [
  "#ff453a",
  "#ffcc00",
  "#32d74b",
  "#0a84ff",
  "#bf5af2",
  "#00000080",
];
export const ColorPickerShowcase = () => {
  const [value, setValue] = useState("#0a84ff");
  const [commit, setCommit] = useState("");
  const [wheel, setWheel] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography
        id="panel-color-picker-result"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify({ commit, disabled, rtl, value, wheel })}
      </Typography>
      <Direction dir={rtl ? "rtl" : "ltr"}>
        <ColorPicker
          value={value}
          onValueChange={setValue}
          onValueCommit={setCommit}
          disabled={disabled}
        >
          <ColorPicker.Field label="Accent" />
          {wheel ? <ColorPicker.Wheel /> : <ColorPicker.Area />}
          <ColorPicker.Channel channel="hue" />
          <ColorPicker.Hue />
          {wheel ? (
            <View className="flex flex-col gap-[16px]">
              <ColorPicker.Channel channel="brightness" />
              <ColorPicker.Brightness />
            </View>
          ) : null}
          <ColorPicker.Channel channel="alpha" />
          <ColorPicker.Alpha />
          <ColorPicker.Swatches colors={COLORS} />
          <ColorPicker.Preview showValue />
        </ColorPicker>
      </Direction>
      <Button variant="outline" onPress={() => setWheel(!wheel)}>
        {wheel ? "Use square" : "Use wheel"}
      </Button>
      <Button variant="outline" onPress={() => setRtl(!rtl)}>
        {rtl ? "LTR" : "RTL"}
      </Button>
      <Button variant="outline" onPress={() => setDisabled(!disabled)}>
        {disabled ? "Enable" : "Disable"}
      </Button>
      <ColorPicker
        presentation="bottom-sheet"
        value={value}
        onValueChange={setValue}
        onValueCommit={setCommit}
      >
        <ColorPicker.Trigger>
          <ColorPicker.Field label="Open sheet picker" />
        </ColorPicker.Trigger>
        <ColorPicker.Content>
          <ColorPicker.Area />
          <ColorPicker.Hue />
          <ColorPicker.Alpha />
          <ColorPicker.Swatches colors={COLORS} />
        </ColorPicker.Content>
      </ColorPicker>
    </View>
  );
};
