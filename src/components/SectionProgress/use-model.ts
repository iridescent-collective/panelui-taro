import { Children, isValidElement, useMemo } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useTimingNumber } from "../../hooks/use-timing-number";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { getRegisteredThemeTokens } from "../../theme/registry";
import { useTheme } from "../../theme/use-theme";
import { SectionProgressItem } from "./item";
import type {
  SectionProgressItemProps,
  SectionProgressProps,
  SectionProgressPlacement,
} from "./types";
import { useSectionProgressReading } from "./use-progress";
import { useSectionProgressState } from "./use-state";
import { useSectionProgressTint } from "./use-tint";

const ALIGNMENT: Record<SectionProgressPlacement, string> = {
  "bottom-center": "items-center",
  "bottom-left": "items-start",
  "bottom-right": "items-end",
  "top-center": "items-center",
  "top-left": "items-start",
  "top-right": "items-end",
};
export const useSectionProgressModel = (props: SectionProgressProps) => {
  const state = useSectionProgressState(props);
  const reduced = usePanelReducedMotion();
  const reading = useSectionProgressReading(props, reduced);
  const { insets } = useWindowMetrics();
  const { theme } = useTheme();
  const tokens = getRegisteredThemeTokens(theme);
  const items = useMemo(
    () =>
      Children.toArray(props.children).flatMap((child) =>
        isValidElement<SectionProgressItemProps>(child) &&
        child.type === SectionProgressItem &&
        typeof child.props.value === "string"
          ? [child.props]
          : []
      ),
    [props.children]
  );
  const active = items.find((item) => item.value === state.value) ?? items[0];
  const color = active?.color ?? "foreground";
  const tint = tokens[color === "danger" ? "destructive" : color];
  const animatedTint = useSectionProgressTint(tint, reduced);
  const expanded = useTimingNumber(state.open ? 1 : 0, 220, reduced);
  const radius = 17 + expanded * 3;
  const placement = props.placement ?? "bottom-center";
  const atTop = placement.startsWith("top");
  const align = ALIGNMENT[placement];
  useBackHandler(state.open, state.close);
  const context = useMemo(
    () => ({ onValueChange: state.onValueChange, tint, value: active?.value }),
    [active?.value, state.onValueChange, tint]
  );
  const activeLabel =
    typeof active?.children === "string" ? active.children : undefined;
  return {
    active,
    activeLabel,
    align,
    animatedTint,
    atTop,
    context,
    insets,
    radius,
    reading,
    reduced,
    state,
    tokens,
  };
};
