import { View } from "@tarojs/components";
import type { ReactNode } from "react";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { RingChartCenterProps } from "./types";

export const RingChartCenter = Object.assign(
  ({
    defaultLabel,
    formatValue,
    children,
    className,
  }: RingChartCenterProps) => {
    const { data, activeIndex, strokeWidth, radiusOf } =
      useChart("RingChart.Center");
    const ring = (activeIndex >= 0 ? data[activeIndex] : data[0]) ?? null;
    const selected = activeIndex >= 0;
    const format = formatValue ?? ((amount: number) => compactNumber(amount));
    const inner = Math.max(
      radiusOf(Math.max(data.length - 1, 0)) - strokeWidth / 2,
      0
    );
    const hole = inner * Math.SQRT2;
    let content: ReactNode = null;
    if (children) {
      content = children(selected ? ring : null);
    } else if (ring) {
      content = (
        <>
          <Text size="xs" muted numberOfLines={1}>
            {selected ? ring.label : (defaultLabel ?? ring.label)}
          </Text>
          <Text
            size={hole < 90 ? "lg" : "xl"}
            weight="semibold"
            numberOfLines={1}
          >
            {format(ring.value, ring)}
          </Text>
          {hole >= 90 ? (
            <Text
              size="xs"
              muted
              numberOfLines={1}
            >{`of ${format(ring.maxValue, ring)}`}</Text>
          ) : null}
        </>
      );
    }
    return (
      <View
        style={{ maxWidth: `${hole * 2}rpx`, pointerEvents: "none" }}
        className={cn("flex flex-col items-center", className)}
      >
        {content}
      </View>
    );
  },
  { displayName: "RingChart.Center", slot: "overlay" as const }
);
