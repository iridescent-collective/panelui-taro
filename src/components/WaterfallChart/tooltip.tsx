import { Canvas, View } from "@tarojs/components";

import { useElementLayout } from "../../hooks/use-element-layout";
import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { useChartPointer } from "../LineChart/use-pointer";
import { Text } from "../primitives/Text";
import { waterfallSignedValue } from "./math";
import { useWaterfallSettings } from "./root";
import type { WaterfallChartTooltipProps } from "./types";

const LABEL_WIDTH = 148;
export const WaterfallChartTooltip = Object.assign(
  ({ formatValue, formatTotal, className }: WaterfallChartTooltipProps) => {
    const {
      plot,
      status,
      activeIndexJS: index,
    } = useChart("WaterfallChart.Tooltip");
    const { orientation, steps: data, colors } = useWaterfallSettings();
    const horizontal = orientation === "horizontal";
    const pointer = useChartPointer((x, y) => {
      if (!data.length) {
        return -1;
      }
      const span = horizontal ? plot.height : plot.width;
      const offset = (horizontal ? y - plot.top : x - plot.left) / (span || 1);
      return Math.max(
        0,
        Math.min(data.length - 1, Math.floor(offset * data.length))
      );
    });
    const active = index >= 0 ? data[index] : null;
    const label = useElementLayout(Boolean(active), [
      active,
      className,
      horizontal,
    ]);
    if (status === "loading") {
      return null;
    }
    const band =
      (horizontal ? plot.height : plot.width) / Math.max(data.length, 1);
    const centre = (horizontal ? plot.top : plot.left) + band * (index + 0.5);
    const half = LABEL_WIDTH / 2;
    const clamped = Math.min(
      plot.left + plot.width - half,
      Math.max(
        plot.left + half,
        horizontal ? plot.left + plot.width / 2 : centre
      )
    );
    const tall = label.layout?.height ?? 0;
    const y = horizontal
      ? Math.min(
          plot.top + Math.max(plot.height - tall, 0),
          Math.max(plot.top, centre - tall / 2)
        )
      : 0;
    let reading: string | null = null;
    let totalReading: string | null = null;
    if (active) {
      reading = formatValue
        ? formatValue(active)
        : waterfallSignedValue(active);
      if (formatTotal) {
        totalReading = formatTotal(active);
      } else if (active.kind !== "total") {
        totalReading = compactNumber(active.end);
      }
    }
    return (
      <View className="absolute inset-0">
        <Canvas
          type="2d"
          aria-hidden
          disableScroll={data.length > 0}
          className="panel-waterfall-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        <View
          aria-hidden
          className="absolute top-0 left-0"
          style={{
            opacity: index < 0 ? 0 : 1,
            pointerEvents: "none",
            transform: `translate(${(clamped - half) * 2}rpx,${y * 2}rpx)`,
            width: `${LABEL_WIDTH * 2}rpx`,
          }}
        >
          {active ? (
            <View
              id={label.id}
              className={cn(
                "flex flex-col rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[20px] py-[12px] shadow-lg",
                className
              )}
            >
              <Text size="xs" muted numberOfLines={1}>
                {active.label}
              </Text>
              <View className="flex flex-row items-center gap-[12px]">
                <View
                  style={{
                    backgroundColor: active.datum.color ?? colors[active.kind],
                  }}
                  className="h-[12px] w-[12px] rounded-full"
                />
                <Text size="xs" weight="medium">
                  {reading}
                </Text>
              </View>
              {totalReading ? (
                <Text size="xs" muted numberOfLines={1}>
                  {totalReading}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    );
  },
  { displayName: "WaterfallChart.Tooltip", layer: "overlay" as const }
);
