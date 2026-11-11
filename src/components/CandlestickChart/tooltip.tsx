import { Canvas, View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "../LineChart/context";
import { useChartPointer } from "../LineChart/use-pointer";
import { Text } from "../primitives/Text";
import { ohlcOf } from "./math";
import { useCandleSettings } from "./root";
import type { CandlestickChartTooltipProps } from "./types";

const OhlcRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex flex-row items-baseline gap-[8px]">
    <Text size="xs" muted>
      {label}
    </Text>
    <Text size="xs" weight="medium" numberOfLines={1}>
      {value}
    </Text>
  </View>
);
export const CandlestickChartTooltip = Object.assign(
  ({
    formatValue = compactNumber,
    formatX,
    showChange = true,
    className,
  }: CandlestickChartTooltipProps) => {
    const {
      data,
      xDataKey,
      plot,
      status,
      activeIndexJS: index,
    } = useChart("CandlestickChart.Tooltip");
    const { openKey, highKey, lowKey, closeKey } = useCandleSettings();
    const pointer = useChartPointer((x) =>
      data.length
        ? Math.max(
            0,
            Math.min(
              data.length - 1,
              Math.floor(((x - plot.left) / (plot.width || 1)) * data.length)
            )
          )
        : -1
    );
    const rising = useThemeToken("success");
    const falling = useThemeToken("destructive");
    const active = index >= 0 ? data[index] : null;
    const ohlc = ohlcOf(
      active ?? undefined,
      openKey,
      highKey,
      lowKey,
      closeKey
    );
    if (status === "loading") {
      return null;
    }
    const center =
      plot.left + (plot.width / Math.max(data.length, 1)) * (index + 0.5);
    const x =
      Math.min(plot.left + plot.width - 74, Math.max(plot.left + 74, center)) -
      74;
    const change = ohlc ? ohlc.close - ohlc.open : 0;
    const percent = ohlc && ohlc.open !== 0 ? (change / ohlc.open) * 100 : 0;
    return (
      <View className="absolute inset-0">
        <Canvas
          type="2d"
          aria-hidden
          disableScroll={data.length > 0}
          className="panel-candle-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        <View
          className="absolute top-0 left-0"
          style={{
            opacity: index < 0 ? 0 : 1,
            pointerEvents: "none",
            transform: `translateX(${x * 2}rpx)`,
            width: "296rpx",
          }}
        >
          {active && ohlc ? (
            <View
              className={cn(
                "flex flex-col gap-[4px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[20px] py-[12px] shadow-lg",
                className
              )}
            >
              <Text size="xs" muted numberOfLines={1}>
                {formatX ? formatX(active) : String(active[xDataKey] ?? "")}
              </Text>
              <View className="flex flex-row gap-[24px]">
                <View className="flex flex-1 flex-col gap-[4px]">
                  <OhlcRow label="O" value={formatValue(ohlc.open, "open")} />
                  <OhlcRow label="H" value={formatValue(ohlc.high, "high")} />
                </View>
                <View className="flex flex-1 flex-col gap-[4px]">
                  <OhlcRow label="L" value={formatValue(ohlc.low, "low")} />
                  <OhlcRow label="C" value={formatValue(ohlc.close, "close")} />
                </View>
              </View>
              {showChange ? (
                <Text
                  size="xs"
                  weight="medium"
                  numberOfLines={1}
                  style={{ color: change >= 0 ? rising : falling }}
                >
                  {change >= 0 ? "+" : ""}
                  {compactNumber(change)} ({percent >= 0 ? "+" : ""}
                  {percent.toFixed(2)}%)
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    );
  },
  { displayName: "CandlestickChart.Tooltip", layer: "overlay" as const }
);
