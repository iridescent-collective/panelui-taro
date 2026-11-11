import { useIconColor } from "panelui-taro/icons";
import { useThemeToken } from "panelui-taro/theme";
import type { ComponentProps } from "react";

import { Drawing } from "../../../src/icons/Drawing";

export const HugeiconsIcon = ({
  icon,
  ...props
}: { icon: ComponentProps<typeof Drawing>["glyph"] } & Omit<
  ComponentProps<typeof Drawing>,
  "glyph" | "color"
> & { color?: string }) => {
  const inherited = useIconColor();
  const foreground = useThemeToken("foreground");
  return (
    <Drawing
      {...props}
      glyph={icon}
      color={props.color ?? inherited ?? foreground}
    />
  );
};
export type IconSvgElement = ComponentProps<typeof Drawing>["glyph"];
