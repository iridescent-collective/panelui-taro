import { View } from "@tarojs/components";
import { useContext } from "react";

import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { KpiStatContext, useKpi } from "./context";
import type { KpiGoodDirection, KpiTone, KpiTrendProps } from "./types";
import { kpiVariants } from "./variants";

const TREND_ICON = 12;
const TREND_STROKE = 2.5;
export const kpiTrendTone = (
  value: number,
  threshold: number,
  polarity: KpiGoodDirection
): KpiTone => {
  if (Math.abs(value) <= threshold) {
    return "flat";
  }
  if (polarity === "none") {
    return "neutral";
  }
  return (value > 0 && polarity === "up") || (value <= 0 && polarity === "down")
    ? "good"
    : "bad";
};
export const KpiTrend = ({
  className,
  value,
  format,
  goodDirection,
  variant = "text",
  caption,
  threshold = 0,
  children,
  ...props
}: KpiTrendProps) => {
  const context = useKpi("Kpi.Trend");
  const flat = Math.abs(value) <= threshold;
  const rising = value > 0;
  const tone = kpiTrendTone(
    value,
    threshold,
    goodDirection ?? context.goodDirection
  );
  const inStat = useContext(KpiStatContext);
  const { trend, trendLabel } = kpiVariants({ tone, trendVariant: variant });
  const goodTint = useThemeToken("success");
  const badTint = useThemeToken("destructive");
  const mutedTint = useThemeToken("muted-foreground");
  let tint = mutedTint;
  if (tone === "good") {
    tint = goodTint;
  } else if (tone === "bad") {
    tint = badTint;
  }
  let Arrow = rising ? ArrowUpIcon : ArrowDownIcon;
  if (flat) {
    Arrow = MinusIcon;
  }
  let sign = rising ? "+" : "";
  if (value < 0) {
    sign = "−";
  }
  const label = format
    ? format(value)
    : `${sign}${Math.abs(value).toFixed(1)}%`;
  let direction = rising ? "Up" : "Down";
  if (flat) {
    direction = "No change";
  }
  return (
    <View
      className={trend({
        className: cn(inStat ? "self-start" : "self-center", className),
      })}
      aria-label={`${direction} ${Math.abs(value).toFixed(1)} percent${caption ? `, ${caption}` : ""}`}
      {...props}
    >
      {variant === "badge" ? (
        <Arrow size={TREND_ICON} strokeWidth={TREND_STROKE} color={tint} />
      ) : null}
      <Text className={trendLabel()}>
        {label}
        {caption ? (
          <Text className="text-[color:var(--panel-muted-foreground)]">
            {" "}
            {caption}
          </Text>
        ) : null}
      </Text>
      {children}
    </View>
  );
};
