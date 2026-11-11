import { View } from "@tarojs/components";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Checkbox } from "panelui-taro/checkbox";
import { Input } from "panelui-taro/input";
import { Text } from "panelui-taro/primitives/text";
import { Switch } from "panelui-taro/switch";
import { useState } from "react";

import { CONTROL_SIZES, NATIVE_SIZE_SCALES } from "../../data/sizing";
import { CustomizationSection } from "../Section";

export const SizingExplorer = () => {
  const [size, setSize] = useState<(typeof CONTROL_SIZES)[number]>("md");
  const [checked, setChecked] = useState(false);
  return (
    <>
      <CustomizationSection
        title="Five control sizes"
        description="md is the default. Each control has its own scale; an sm Button and an sm Input do not have the same height."
      >
        <View className="flex flex-row flex-wrap gap-[12px]">
          {CONTROL_SIZES.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={size === value ? "primary" : "outline"}
              accessibilityLabel={`Use ${value} size`}
              onPress={() => setSize(value)}
            >
              {value}
            </Button>
          ))}
        </View>
        <Button size={size}>Button / {size}</Button>
        <Input size={size} placeholder={`Input / ${size}`} />
        <Badge size={size}>Badge / {size}</Badge>
        <Checkbox
          size={size}
          checked={checked}
          onCheckedChange={setChecked}
          label={`Checkbox / ${size}`}
        />
        <View className="flex flex-row items-center justify-between gap-[24px]">
          <Text size="sm">Switch / {size}</Text>
          <Switch
            size={size}
            value={checked}
            onValueChange={setChecked}
            label={`Switch / ${size}`}
          />
        </View>
      </CustomizationSection>
      <CustomizationSection
        title="Native size scales"
        description="Values are logical points before the port's 750-design conversion. The final rendered size follows the mini program viewport."
      >
        <View className="flex flex-col gap-[20px]">
          {NATIVE_SIZE_SCALES.map((row) => (
            <View key={row.name}>
              <Text weight="medium" size="sm">
                {row.name} / {row.unit}
              </Text>
              <Text size="xs" muted>
                xs {row.values[0]} · sm {row.values[1]} · md {row.values[2]} ·
                lg {row.values[3]} · xl {row.values[4]}
              </Text>
            </View>
          ))}
        </View>
      </CustomizationSection>
      <CustomizationSection
        title="Touch targets"
        description="Small controls retain their target extensions. Keep at least 8 logical points between neighboring xs controls, and leave room in the parent for the extension."
      >
        <Text size="sm" muted>
          Checkbox and RadioGroup rows remain larger than their drawn controls.
          WeChat hit regions depend on parent clipping and native event
          behavior; device acceptance is separate from the size scale.
        </Text>
      </CustomizationSection>
    </>
  );
};
