import CustomArrowGlyph from "@hugeicons/core-free-icons/ArrowRight01Icon";
import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Direction } from "panelui-taro/direction";
import { useCopyToClipboard } from "panelui-taro/hooks/use-copy-to-clipboard";
import { SearchIcon, createIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Text } from "panelui-taro/primitives/text";
import { Switch } from "panelui-taro/switch";
import { useState } from "react";

import { ICON_CATALOG } from "../../data/icons";
import { CustomizationSection } from "../Section";

const CustomArrowIcon = createIcon(CustomArrowGlyph, {
  color: "#737373",
  fillable: true,
  flip: true,
  size: 24,
});

const ICON_SIZES = [16, 24, 32] as const;
const ICON_WEIGHTS = [1.5, 2, 3] as const;
export const IconExplorer = () => {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState(24);
  const [weight, setWeight] = useState(2);
  const [filled, setFilled] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [status, setStatus] = useState("Tap an icon to copy its JSX tag.");
  const { copy } = useCopyToClipboard();
  const filtered = ICON_CATALOG.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  const copyIcon = async (name: string) => {
    try {
      await copy(`<${name} />`);
      setStatus(`Copied <${name} />`);
    } catch {
      setStatus("Could not copy. Try again.");
    }
  };
  return (
    <>
      <CustomizationSection
        title="Icon controls"
        description="Sizes are logical points. Filled state and RTL mirroring apply only to icons that support them."
      >
        <Input
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search icons"
          placeholder="Search icons by name"
        />
        <View className="flex flex-row flex-wrap gap-[12px]">
          {ICON_SIZES.map((value) => (
            <Button
              key={value}
              size="xs"
              variant={size === value ? "primary" : "outline"}
              onPress={() => setSize(value)}
              accessibilityLabel={`Icon size ${value}`}
            >
              {value}px
            </Button>
          ))}
        </View>
        <View className="flex flex-row flex-wrap gap-[12px]">
          {ICON_WEIGHTS.map((value) => (
            <Button
              key={value}
              size="xs"
              variant={weight === value ? "primary" : "outline"}
              onPress={() => setWeight(value)}
              accessibilityLabel={`Icon weight ${value}`}
            >
              {value} stroke
            </Button>
          ))}
        </View>
        <View className="flex flex-row items-center justify-between gap-[24px]">
          <Text size="sm">Filled icons</Text>
          <Switch
            value={filled}
            onValueChange={setFilled}
            label="Filled icons"
          />
        </View>
        <View className="flex flex-row items-center justify-between gap-[24px]">
          <Text size="sm">Right to left</Text>
          <Switch value={rtl} onValueChange={setRtl} label="Right to left" />
        </View>
        <Button startContent={<SearchIcon size={16} />}>
          Inherited foreground
        </Button>
        <Direction dir={rtl ? "rtl" : "ltr"}>
          <CustomArrowIcon
            size={size}
            strokeWidth={weight}
            filled={filled}
            data-testid="custom-glyph"
          />
        </Direction>
        <Text size="xs" muted>
          {status}
        </Text>
      </CustomizationSection>
      <CustomizationSection
        title={`${filtered.length} / ${ICON_CATALOG.length} icons`}
        description="The gallery includes Camera icons. The directional preview above uses a custom glyph created with the public factory."
      >
        <View className="customization-icon-grid">
          {filtered.map(({ name, Icon }) => (
            <Button
              key={name}
              variant="ghost"
              className="customization-icon-tile"
              accessibilityLabel={`Copy ${name}`}
              onPress={() => copyIcon(name)}
            >
              <Direction dir={rtl ? "rtl" : "ltr"}>
                <Icon size={size} strokeWidth={weight} filled={filled} />
              </Direction>
              <Text size="xs" className="customization-icon-name">
                {name.replace(/Icon$/u, "")}
              </Text>
            </Button>
          ))}
        </View>
        {filtered.length === 0 ? (
          <Text muted>No icons match this search.</Text>
        ) : null}
      </CustomizationSection>
    </>
  );
};
