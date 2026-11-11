import { View } from "@tarojs/components";
import { useContext } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSpringNumber } from "../../hooks/use-spring-number";
import { interpolatePanelColor } from "../../lib/interpolate-color";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { proximityTo, SPRING } from "./constants";
import { useSectionRail, SectionRailBarsContext } from "./context";
import type { SectionRailBarProps } from "./types";

export const SectionRailBar = ({
  className,
  value,
  level = 0,
}: SectionRailBarProps) => {
  const { value: active } = useSectionRail("SectionRail.Bar");
  const values = useContext(SectionRailBarsContext);
  const reduced = usePanelReducedMotion();
  const progress = useSpringNumber(
    proximityTo(value, active, values),
    SPRING,
    reduced
  ).value;
  const idle = useThemeToken("muted-foreground");
  const on = useThemeToken("foreground");
  return (
    <View
      aria-hidden
      className={cn("h-[4px] rounded-full", className)}
      style={{
        backgroundColor: interpolatePanelColor(idle, on, progress),
        opacity: 0.32 + progress * 0.68,
        width: `${(Math.max(14 - level * 3, 6) + progress * 10) * 2}rpx`,
      }}
    />
  );
};
