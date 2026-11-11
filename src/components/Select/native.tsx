import { Picker, PickerView, PickerViewColumn, View } from "@tarojs/components";
import { nextTick } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import { Text } from "../primitives/Text";
import type { SelectProps, SelectItemProps } from "./types";

export const NativeSelect = ({
  value,
  disabled,
  nativeAppearance,
  onValueChange,
  options,
}: Pick<
  SelectProps,
  "value" | "disabled" | "nativeAppearance" | "onValueChange"
> & { options: SelectItemProps[] }) => {
  const [revision, setRevision] = useState(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const owner = useRef(value);
  owner.current = value;
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const request = (next: number) => {
    const option = options[next];
    if (disabled || !option || option.disabled) {
      return;
    }
    onValueChange(option.value);
    nextTick(() => {
      if (mounted.current && owner.current !== option.value) {
        setRevision((current) => current + 1);
      }
    });
  };
  if (nativeAppearance === "wheel") {
    return (
      <PickerView
        key={revision}
        value={[index]}
        style={{
          height: "432rpx",
          opacity: disabled ? 0.64 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
        aria-disabled={Boolean(disabled)}
        onChange={(event) => request(event.detail.value[0] ?? index)}
      >
        <PickerViewColumn>
          {options.map((option) => (
            <View
              key={option.value}
              className="flex h-[88px] items-center justify-center"
            >
              <Text>{option.label}</Text>
            </View>
          ))}
        </PickerViewColumn>
      </PickerView>
    );
  }
  return (
    <Picker
      key={revision}
      mode="selector"
      disabled={disabled}
      range={options}
      rangeKey="label"
      value={index}
      onChange={(event) => request(Number(event.detail.value))}
    >
      <View className="py-[16px]">
        <Text>{options[index]?.label}</Text>
      </View>
    </Picker>
  );
};
