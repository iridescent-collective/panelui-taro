import type { ToggleIconProps } from "panelui-taro/icons";
import type { ComponentType } from "react";

export interface IconEntry {
  Icon: ComponentType<ToggleIconProps>;
  name: string;
}
