import { Text as PanelText } from "panelui-taro/primitives/text";
import type { ComponentProps } from "react";

export const Text = ({
  className,
  ...props
}: ComponentProps<typeof PanelText>) => (
  <PanelText {...props} className={`block ${className ?? ""}`} />
);
