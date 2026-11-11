import { View } from "@tarojs/components";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { ClockFaceLayout } from "./clock";
import { RulerFace } from "./ruler";
import type { FaceProps, TimePickerLayout } from "./types";
import { timePickerVariants } from "./variants";
import { WheelFace } from "./wheel";

export interface PanelProps extends FaceProps {
  layout: TimePickerLayout;
  className?: string;
  fullWidth?: boolean;
  footer?: ReactNode;
}
export const Panel = ({
  layout,
  className,
  fullWidth,
  footer,
  ...face
}: PanelProps) => {
  const slots = timePickerVariants();
  return (
    <View
      className={cn("flex flex-col", slots.panel(), className)}
      style={fullWidth ? undefined : { width: "600rpx" }}
    >
      {layout === "wheel" ? <WheelFace {...face} /> : null}
      {layout === "clock" ? <ClockFaceLayout {...face} /> : null}
      {layout === "ruler" ? <RulerFace {...face} /> : null}
      {footer}
    </View>
  );
};
