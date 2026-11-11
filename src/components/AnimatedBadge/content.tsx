import { View } from "@tarojs/components";
import type { ReactNode } from "react";

import { IconColorProvider } from "../../icons";
import { cn } from "../../lib/utils";
import { ICON_SIZE, STATUS_ICON } from "./constants";
import { LoadingRing } from "./loading-ring";
import { Roll } from "./roll";
import type { AnimatedBadgeSize, AnimatedBadgeStatus } from "./types";

export const hasBadgeLabel = (children: ReactNode) =>
  children !== null && children !== undefined && typeof children !== "boolean";
export const BadgeGlyph = ({
  status,
  size,
  color,
  icon,
  reduced,
  className,
}: {
  status: AnimatedBadgeStatus;
  size: AnimatedBadgeSize;
  color: string;
  icon?: ReactNode;
  reduced: boolean;
  className?: string;
}) => {
  const Icon = STATUS_ICON[status];
  const glyph =
    status === "loading" ? (
      <LoadingRing
        size={ICON_SIZE[size]}
        color={color}
        reducedMotion={reduced}
      />
    ) : (
      <Icon size={ICON_SIZE[size]} color={color} />
    );
  return (
    <View
      className={cn(className, "flex shrink-0")}
      style={{ height: `${(ICON_SIZE[size] + 4) * 2}rpx` }}
    >
      <IconColorProvider color={color}>
        <Roll contentKey={status} reducedMotion={reduced} turn>
          {icon ?? glyph}
        </Roll>
      </IconColorProvider>
    </View>
  );
};
