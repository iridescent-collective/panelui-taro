import { View } from "@tarojs/components";
import type { ReactNode } from "react";

import { IconColorProvider } from "../../../icons/context";
import { textChildren } from "../../primitives/Text";

export interface InputContentProps {
  id: string;
  children: ReactNode;
  color: string;
  className: string;
  side: "left" | "right";
  interactive: boolean;
}
export const InputContent = ({
  id,
  children,
  color,
  className,
  side,
  interactive,
}: InputContentProps) => (
  <View
    id={id}
    className={className}
    aria-hidden={!interactive}
    style={{ [side]: 0, pointerEvents: "none" }}
  >
    <View
      className="flex flex-row items-center gap-[16px]"
      style={{ pointerEvents: interactive ? "auto" : "none" }}
    >
      <IconColorProvider color={color}>
        {textChildren(children)}
      </IconColorProvider>
    </View>
  </View>
);
